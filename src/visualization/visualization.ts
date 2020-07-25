
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
    gl_PointSize = 4.0;
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
    isDrawEVectorLines: boolean

    constructor(canvas: HTMLCanvasElement, sim: Simulation) {
        this.canvas = canvas
        this.sim = sim

        this.testPointCount = 1000

        this.width = 20
        this.init()
        this.renderLoop()
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(70, this.canvas.width / this.canvas.height, 0.01, 100);
        this.camera.position.z = 20;
        this.camera.position.y = 10;

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

        let geometry = new THREE.SphereGeometry(.1);
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

    drawVectorField(vf: VectorField) {

        let width = this.width / 2

        let skipCount = 1
        let maxValue = -100000000;
        for (let x = -width; x < width; x += skipCount) {
            for (let y = -width; y < width; y += skipCount) {
                for (let z = -width; z < width; z += skipCount) {
                    let v = vf.evaluate(x, y, z)
                    if (v.magnitude() > maxValue) {
                        maxValue = v.magnitude()
                    }
                }
            }
        }

        var points = [];
        var ends = [];
        var alphas = []
        for (let x = -width; x < width; x += skipCount) {
            for (let y = -width; y < width; y += skipCount) {
                for (let z = -width; z < width; z += skipCount) {
                    let v = vf.evaluate(x, y, z)
                    let vScaled = v.multiplyScalar(1 / maxValue)

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

        var geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({ color: 0xFF0000, linewidth: 10 });
        var line = new THREE.LineSegments(geometry, material);
        line.name = "e_vector_field"
        this.scene.add(line)


        let uniforms = {
            color: { value: new THREE.Color(0xff0000) },
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
        var endsPoint = new THREE.Points(geometry, shaderMaterial);
        endsPoint.name = "e_vector_field_ends"
        this.scene.add(endsPoint);
    }

    updateEVectorField() {
        var lineObject = this.scene.getObjectByName("e_vector_field")
        if (!lineObject) {
            console.log("There is no vector field to update!")
            return
        }

        var endObject = this.scene.getObjectByName("e_vector_field_ends")
        if (!endObject) {
            console.log("SKIPP")
            return
        }

        var eField = this.sim.E()

        let positions = (lineObject as THREE.Points<THREE.BufferGeometry, THREE.LineBasicMaterial>).geometry.attributes.position;
        let endPositions = (endObject as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>).geometry.attributes.position;
        let endAlphas = (endObject as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>).geometry.attributes.alpha;

        if (!endPositions) {
            alert("done")
        }

        let maxValue = -100000000;
        for (let i = 0; i < positions.count; i += 2) {
            let p = new Vector(positions.getX(i), positions.getY(i), positions.getZ(i))
            let v = eField.evaluate(p.x(), p.y(), p.z())
            if (v.magnitude() > maxValue) {
                maxValue = v.magnitude()
            }
        }

        for (let i = 0; i < positions.count; i += 2) {
            let p = new Vector(positions.getX(i), positions.getY(i), positions.getZ(i))
            // let v = eField.evaluate(p.x(), p.y(), p.z())
            let v = eField.evaluate(p.x(), p.y(), p.z()).multiplyScalar(1 / maxValue)

            positions.setX(i + 1, p.x() + v.x())
            positions.setY(i + 1, p.y() + v.y())
            positions.setZ(i + 1, p.z() + v.z())
            endPositions.setX(i / 2, p.x() + v.x())
            endPositions.setY(i / 2, p.y() + v.y())
            endPositions.setZ(i / 2, p.z() + v.z())

            if (v.magnitude() < .05) {
                endAlphas.setX(i / 2, 0)
            } else {
                endAlphas.setX(i / 2, 2 * v.magnitude())
            }
        }

        endPositions['needsUpdate'] = true;
        positions['needsUpdate'] = true;
        endAlphas['needsUpdate'] = true
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
        points.name = "eTestPoints"
        this.scene.add(points);
    }

    updateTestPoints() {
        let testPoints = this.scene.getObjectByName("eTestPoints")

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

    renderLoop() {

        this.stats.begin()
        this.controls.update()
        this.animate()
        this.renderer.render(this.scene, this.camera);

        this.sim.wasDirty = false

        this.stats.end()

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
            this.drawVectorField(this.sim.E())
        } else if (!this.isDrawEVectorField && !!this.scene.getObjectByName("e_vector_field")) {
            this.scene.remove(this.scene.getObjectByName("e_vector_field"))
            this.scene.remove(this.scene.getObjectByName("e_vector_field_ends"))

        } else if (this.isDrawEVectorField && (this.sim.wasDirty || this.sim.isDirty)) {
            this.updateEVectorField()
            // this.scene.remove(this.scene.getObjectByName("e_vector_field"))
            // this.drawVectorField(this.sim.E())
        }

        this.updateTestPoints()
        for (let point of this.sim.points) {
            let pointMesh = this.scene.getObjectByName(point.name)
            if (!pointMesh) {
                console.log("point doesn't exist")
                this.addPoint(point)
            } else {
                pointMesh.position.x = point.position.x()
                pointMesh.position.y = point.position.y()
                pointMesh.position.z = point.position.z()
                // pointMesh.position.x += .1
            }
        }


    }
}
