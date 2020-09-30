
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as  Stats from 'stats.js'
import { Vector } from '../calc/vector';
import { VectorField } from '../calc/vector_field';
import { Simulation } from '../simulation/simulation';
import { Point } from "../simulation/shapes"
import { ArrowHelper } from 'three';

let PositiveChargeColor = 0x0000FF
let NegativeChargeColor = 0xFF0000

let vertexShader = `
attribute float alpha;
varying float vAlpha;

void main() {
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * mvPosition;
}`

let fragmentShader = `
uniform vec3 color;
varying float vAlpha;

void main() {
    gl_FragColor = vec4( color, vAlpha );
}`

export class Visualization {
    camera: THREE.Camera
    canvas: HTMLCanvasElement
    scene: THREE.Scene

    animationID: number

    renderer: THREE.Renderer
    controls: OrbitControls
    stats: Stats

    width: number

    sim: Simulation

    // scene
    isDrawGrid: boolean
    isDrawETestPoints: boolean
    testPointCount: number

    isDrawEVectorField: boolean
    isDrawBVectorField: boolean

    isDrawEFieldLines: boolean

    isRotateScene: boolean

    constructor(canvas: HTMLCanvasElement, sim: Simulation) {
        this.canvas = canvas
        this.sim = sim

        this.testPointCount = 500

        this.width = 20
        this.init()
        this.renderLoop()
        this.isRotateScene = true
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(70, this.canvas.width / this.canvas.height, 0.01, 100);
        this.camera.position.z = 10;
        this.camera.position.y = 1;

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autoRotateSpeed = 5
        this.controls.autoRotate = true
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

    }

    resize(width, height: number) {
        console.log('resize', width, height)
        this.renderer.setSize(width, height);
    }

    drawGrid() {
        var size = this.width;
        var divisions = this.width;
        var gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.name = "grid"
        this.scene.add(gridHelper);
    }

    addPoint(p: Point) {
        let color = NegativeChargeColor
        if (p.charge > 0) {
            color = PositiveChargeColor
        }

        let geometry = new THREE.SphereGeometry(.3);
        var material = new THREE.MeshBasicMaterial({ color: color });
        let mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = p.position.x()
        mesh.position.y = p.position.y()
        mesh.position.z = p.position.z()
        mesh.name = p.name
        this.scene.add(mesh);
    }

    drawSphere(origin: Vector, color: number) {
        let geometry = new THREE.SphereGeometry(.1);
        var material = new THREE.MeshBasicMaterial({ color: color });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = origin.x()
        mesh.position.y = origin.y()
        mesh.position.z = origin.z()
        this.scene.add(mesh);
    }

    drawVectorField(vf: VectorField, color: number = 0xFF0000, name: string = "e_field", scale: number = 1) {

        let width = this.width / 2

        let skipCount = 3
        let maxValue = -100000000;
        let evaluations: number[][][]

        evaluations = []
        for (let x = -width; x < width; x += skipCount) {
            evaluations[x] = new Array()
            for (let y = -width; y < width; y += skipCount) {
                evaluations[x][y] = new Array()
                for (let z = -width; z < width; z += skipCount) {
                    let v = vf.evaluate(x, y, z)
                    evaluations[x][y][z]
                    if (v.magnitude() > maxValue) {
                        maxValue = v.magnitude()
                    }
                }
            }
        }

        if (maxValue == 0) {
            return
        }

        var points = [];
        var ends = [];
        var alphas = []
        for (let x = -width; x < width; x += skipCount) {
            for (let y = -width; y < width; y += skipCount) {
                for (let z = -width; z < width; z += skipCount) {
                    let v = vf.evaluate(x, y, z)
                    let vScaled = v.multiplyScalar(1 / maxValue).multiplyScalar(scale)

                    if (vScaled.magnitude() > .05) {
                        points.push(new THREE.Vector3(x, y, z));
                        points.push(new THREE.Vector3(x + vScaled.x(), y + vScaled.y(), z + vScaled.z()))
                    } else {
                        points.push(new THREE.Vector3(0, 0, 0))
                        points.push(new THREE.Vector3(0, 0, 0))
                    }

                    ends.push(new THREE.Vector3(x + vScaled.x(), y + vScaled.y(), z + vScaled.z()))
                    if (vScaled.magnitude() < .1) {
                        alphas.push(0)
                    } else {
                        alphas.push(vScaled.magnitude() * 2)
                    }
                    // alphas.push(1)
                }
            }
        }

        var lineObject = this.scene.getObjectByName(name)
        if (!lineObject) {
            var geometry = new THREE.BufferGeometry().setFromPoints(points);
            var material = new THREE.LineBasicMaterial({ color: color, linewidth: 10 });
            lineObject = new THREE.LineSegments(geometry, material);
            lineObject.name = name
            this.scene.add(lineObject)
        } else {
            let positions = (lineObject as THREE.Points<THREE.BufferGeometry, THREE.LineBasicMaterial>);
            positions.geometry.setFromPoints(points)
            // positions.geometry.setAttribute("position", new THREE.Vect(points, 3));
            // positions.geometry["position"]["needsUpdate"] = true
        }

        var endObject = this.scene.getObjectByName(name + "_ends")
        if (!endObject) {
            let uniforms = {
                color: { value: new THREE.Color(color) },
            };

            // point cloud material
            var shaderMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
            });

            var geometry = new THREE.BufferGeometry().setFromPoints(ends);
            geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));
            endObject = new THREE.Points(geometry, shaderMaterial);
            endObject.name = name + "_ends"
            this.scene.add(endObject);
        } else {
            let endPositions = (endObject as THREE.Points<THREE.BufferGeometry, THREE.LineBasicMaterial>);

            endPositions.geometry.setFromPoints(ends)
            endPositions.geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));
        }
    }

    drawTestPoints() {
        var vertices = [];

        for (var i = 0; i < this.testPointCount; i++) {
            var x = THREE.MathUtils.randFloatSpread(this.width);
            var y = THREE.MathUtils.randFloatSpread(this.width);
            var z = THREE.MathUtils.randFloatSpread(this.width);

            vertices.push(x, y, z);
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        var material = new THREE.PointsMaterial({ color: 0xBB0000, size: .2 });

        var points = new THREE.Points(geometry, material);
        points.userData["type"] = "testPoint"
        points.name = "e_test_points"
        this.scene.add(points);
    }

    updateTestPoints() {
        let testPoints = this.scene.getObjectByName("e_test_points")

        if (!testPoints) {
            return
        }
        let positions = (testPoints as THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>).geometry.attributes.position;

        let eField = this.sim.E()
        for (let i = 0; i < positions.count; i++) {

            if (Math.random() < .01) {
                positions.setXYZ(i, THREE.MathUtils.randFloatSpread(this.width), THREE.MathUtils.randFloatSpread(this.width), THREE.MathUtils.randFloatSpread(this.width));
            }

            let p = new Vector(positions.getX(i), positions.getY(i), positions.getZ(i))
            let newP = p.add(eField.evaluate(p.x(), p.y(), p.z()))
            positions.setXYZ(i, newP.x(), newP.y(), newP.z());
        }

        positions['needsUpdate'] = true;
    }

    drawEFieldLines() {
        var eField = this.sim.E()

        let max_steps = 400;
        let group = new THREE.Group()

        for (let p of this.sim.positiveObjects()) {
            let start = p.position;
            let startOffsets = []

            let totalPhi = 4
            let totalTheta = 4
            for (let p = 0; p < totalPhi; p++) {
                for (let t = 0; t < totalTheta; t++) {
                    let s = new THREE.Spherical(.1, Math.PI * p / totalPhi, Math.PI * 2 * t / totalTheta)
                    let v = new THREE.Vector3(0, 0, 0).setFromSpherical(s)
                    startOffsets.push(new Vector(v.x, v.y, v.z))
                }
            }

            for (let i = 0; i < 5; i++) {
                startOffsets.push(
                    new Vector(THREE.MathUtils.randFloatSpread(.2), THREE.MathUtils.randFloatSpread(.2), THREE.MathUtils.randFloatSpread(.2))
                )
            }

            for (let offset of startOffsets) {
                let curr = start.add(offset)
                let step = 0
                var points = [];
                points.push(new THREE.Vector3(start.x(), start.y(), start.z()))
                while (step < max_steps) {
                    let deltaCurr = eField.evaluate(curr.x(), curr.y(), curr.z())
                    if (deltaCurr.magnitude() < .001) {
                        break
                    }
                    curr = curr.add(deltaCurr.unit().multiplyScalar(.5))
                    points.push(new THREE.Vector3(curr.x(), curr.y(), curr.z()))
                    step++
                }

                var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
                var geometry = new THREE.BufferGeometry().setFromPoints(points);

                var line = new THREE.Line(geometry, material);
                group.add(line)
            }
        }
        group.name = "e_field_lines"
        this.scene.add(group)
    }

    renderLoop() {

        this.stats.begin()
        if (this.isRotateScene) {
            this.controls.update()
        }
        this.animate()
        this.renderer.render(this.scene, this.camera);

        this.sim.wasDirty = false

        this.stats.end()

        if (this.sim.isActive) {
            this.sim.step(1 / 60)
        }

        this.animationID = requestAnimationFrame(() => this.renderLoop());
    }

    destroy() {
        cancelAnimationFrame(this.animationID);// Stop the animation
        this.scene.dispose()
    }

    animate() {
        if (this.isDrawGrid && !this.scene.getObjectByName("grid")) {
            this.drawGrid()
        } else if (!this.isDrawGrid && !!this.scene.getObjectByName("grid")) {
            this.scene.remove(this.scene.getObjectByName("grid"))
        }

        if (this.isDrawEVectorField && !this.scene.getObjectByName("e_vector_field")) {
            this.drawVectorField(this.sim.E_static(), 0xFF0000, "e_vector_field", .3)
        } else if (!this.isDrawEVectorField && !!this.scene.getObjectByName("e_vector_field")) {
            this.scene.remove(this.scene.getObjectByName("e_vector_field"))
            this.scene.remove(this.scene.getObjectByName("e_vector_field_ends"))
        } else if (this.isDrawEVectorField && (this.sim.wasDirty || this.sim.isDirty)) {
            this.drawVectorField(this.sim.E_static(), 0xFF0000, "e_vector_field", .3)
        }

        if (this.isDrawBVectorField && !this.scene.getObjectByName("b_vector_field")) {
            this.drawVectorField(this.sim.B_static(), 0x0000FF, "b_vector_field", .5)
        } else if (!this.isDrawBVectorField && !!this.scene.getObjectByName("b_vector_field")) {
            this.scene.remove(this.scene.getObjectByName("b_vector_field"))
            this.scene.remove(this.scene.getObjectByName("b_vector_field_ends"))
        } else if (this.isDrawBVectorField && (this.sim.wasDirty || this.sim.isDirty)) {
            this.drawVectorField(this.sim.B_static(), 0x0000FF, "b_vector_field", .5)
        }


        if (this.isDrawETestPoints && !this.scene.getObjectByName("e_test_points")) {
            this.drawTestPoints()
        } else if (!this.isDrawETestPoints && !!this.scene.getObjectByName("e_test_points")) {
            this.scene.remove(this.scene.getObjectByName("e_test_points"))
        } else if (this.isDrawETestPoints) {
            this.updateTestPoints()
        }

        if (this.isDrawEFieldLines && !this.scene.getObjectByName("e_field_lines")) {
            this.drawEFieldLines()
        } else if (!this.isDrawEFieldLines && !!this.scene.getObjectByName("e_field_lines")) {
            this.scene.remove(this.scene.getObjectByName("e_field_lines"))
        } else if (this.isDrawEFieldLines && (this.sim.wasDirty || this.sim.isDirty)) {
            console.log("REMOVE")
            this.scene.remove(this.scene.getObjectByName("e_field_lines"))
        }

        for (let point of this.sim.points) {
            let pointMesh = this.scene.getObjectByName(point.name)
            if (!pointMesh) {
                console.log("point doesn't exist")
                this.addPoint(point)
            } else {
                pointMesh.position.x = point.position.x()
                pointMesh.position.y = point.position.y()
                pointMesh.position.z = point.position.z()
            }
        }
    }
}
