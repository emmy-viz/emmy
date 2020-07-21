
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Vector } from '../vector';
import { VectorField } from '../vector_field';

export class Viz {
    camera: THREE.Camera
    canvas: HTMLCanvasElement
    scene: THREE.Scene

    renderer: THREE.Renderer
    controls: OrbitControls
    width: number

    testPointCount: number
    testPointE: VectorField

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.width = 20
        this.init()
        this.animate()
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(70, this.canvas.width / this.canvas.height, 0.01, 100);
        this.camera.position.z = 10;
        this.camera.position.y = 5;

        this.scene = new THREE.Scene();

        // let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        // let material = new THREE.MeshNormalMaterial();

        // let mesh = new THREE.Mesh(geometry, material);
        // this.scene.add(mesh);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        // document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autoRotateSpeed = 5
        this.controls.autoRotate = true

        // this.drawGrid()
        this.testPointCount = 1000
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

    drawTestPoints(E: VectorField) {
        this.testPointE = E

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
        for (let c = 0; c < this.scene.children.length; c++) {
            if (this.scene.children[c].userData["type"] == "testPoint") {
                var positions = (this.scene.children[c] as THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>).geometry.attributes.position;

                for (let i = 0; i < positions.count; i++) {

                    if (Math.random() < .01) {
                        positions.setXYZ(i, THREE.MathUtils.randFloatSpread(this.width), THREE.MathUtils.randFloatSpread(this.width), THREE.MathUtils.randFloatSpread(this.width));
                    }

                    let p = new Vector(positions.getX(i), positions.getY(i), positions.getZ(i))
                    let newP = p.add(this.testPointE.evaluate(p.x(), p.y(), p.z()).multiplyScalar(1))
                    positions.setXYZ(i, newP.x(), newP.y(), newP.z());
                }

                positions['needsUpdate'] = true;

            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update()

        this.updateTestPoints()

        this.renderer.render(this.scene, this.camera);

    }
}

export class TestPoint {
    life: number

    mesh: THREE.Mesh

    constructor(m: THREE.Mesh) {
        this.mesh = m
    }
}

function fromTHREEVector(v: THREE.Vector3): Vector {
    return new Vector(v.x, v.y, v.z)
}

function toTHREEVector(v: Vector): THREE.Vector3 {
    return new THREE.Vector3(v.x(), v.y(), v.z())
}