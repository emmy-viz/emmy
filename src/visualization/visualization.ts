
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as  Stats from 'stats.js'
import { Vector } from '../calc/vector';
import { VectorField } from '../calc/vector_field';
import { Simulation } from '../simulation/simulation';
import { Point } from "../simulation/shapes"

let PositiveChargeColor = 0x0000FF
let NegativeChargeColor = 0xFF0000

export class Visualization {
    camera: THREE.Camera
    canvas: HTMLCanvasElement
    scene: THREE.Scene

    animationID: number

    renderer: THREE.Renderer
    controls: OrbitControls
    stats: Stats

    width: number

    // scene
    testPointCount: number
    sim: Simulation


    constructor(canvas: HTMLCanvasElement, sim: Simulation) {
        this.canvas = canvas
        this.sim = sim

        this.width = 30
        this.init()
        this.renderLoop()
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(70, this.canvas.width / this.canvas.height, 0.01, 100);
        this.camera.position.z = 20;
        this.camera.position.y = 10;

        this.scene = new THREE.Scene();

        // let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        // let material = new THREE.MeshNormalMaterial();

        // let mesh = new THREE.Mesh(geometry, material);
        // this.scene.add(mesh);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
        // this.renderer.setSize(this.canvas.width, this.canvas.height);
        // document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autoRotateSpeed = 5
        this.controls.autoRotate = true

        this.drawGrid()
        this.testPointCount = 1000

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
        // var gridHelper2 = new THREE.GridHelper(size, divisions);
        // gridHelper2.rotation.x += Math.PI / 2
        // var gridHelper3 = new THREE.GridHelper(size, divisions);
        // gridHelper3.rotation.z += Math.PI / 2
        // this.scene.add(gridHelper, gridHelper2, gridHelper3);
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

    drawVector(origin, v: Vector, color?: number): THREE.ArrowHelper {
        var unit = v.unit()
        var dir = new THREE.Vector3(unit.x(), unit.y(), unit.z());
        var length = v.magnitude();

        if (!color) {
            color = Math.random() * 0xffffff
        }

        var arrowHelper = new THREE.ArrowHelper(dir, new THREE.Vector3(origin.x(), origin.y(), origin.z()), length, color);
        this.scene.add(arrowHelper);
        return arrowHelper
    }

    drawVectorField(vf: VectorField, color?: number, widthScale?: number) {
        if (!color) {
            color = 0xff0000
        }

        if (!widthScale) {
            widthScale = 1
        }

        let width = this.width / (2 * widthScale)

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

        for (let x = -width; x < width; x += skipCount) {
            for (let y = -width; y < width; y += skipCount) {
                for (let z = -width; z < width; z += skipCount) {
                    let v = vf.evaluate(x, y, z)

                    if (v.magnitude() / maxValue < .05) {
                        continue
                    }

                    let arrow = this.drawVector(new Vector(x, y, z), v.multiplyScalar(1 / maxValue), color)
                    arrow.scale.x = 5
                    arrow.scale.z = 5
                }
            }
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
        this.scene.add(points);
    }

    updateTestPoints() {
        let eField = this.sim.E()
        for (let c = 0; c < this.scene.children.length; c++) {
            if (this.scene.children[c].userData["type"] == "testPoint") {
                var positions = (this.scene.children[c] as THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>).geometry.attributes.position;

                for (let i = 0; i < positions.count; i++) {

                    if (Math.random() < .01) {
                        positions.setXYZ(i, THREE.MathUtils.randFloatSpread(this.width), THREE.MathUtils.randFloatSpread(this.width), THREE.MathUtils.randFloatSpread(this.width));
                    }

                    let p = new Vector(positions.getX(i), positions.getY(i), positions.getZ(i))
                    let newP = p.add(eField.evaluate(p.x(), p.y(), p.z()).multiplyScalar(1))
                    positions.setXYZ(i, newP.x(), newP.y(), newP.z());
                }

                positions['needsUpdate'] = true;

            }
        }
    }

    renderLoop() {

        this.stats.begin()
        this.controls.update()
        this.animate()
        this.renderer.render(this.scene, this.camera);

        this.stats.end()

        this.animationID = requestAnimationFrame(() => this.renderLoop());
    }

    destroy() {
        cancelAnimationFrame(this.animationID);// Stop the animation
        this.scene.dispose()

    }

    animate() {

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
