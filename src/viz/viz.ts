
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

        this.drawGrid()
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

    drawVectorField(vf: VectorField, color?: number) {
        if (!color) {
            color = 0xff0000
        }

        let skipCount = 3
        let maxValue = -100000000;
        for (let x = -this.width / 2; x < this.width / 2; x += skipCount) {
            for (let y = -this.width / 2; y < this.width / 2; y += skipCount) {
                for (let z = -this.width / 2; z < this.width / 2; z += skipCount) {
                    let v = vf.evaluate(x, y, z)
                    if (v.magnitude() > maxValue) {
                        maxValue = v.magnitude()
                    }
                }
            }
        }

        for (let x = -this.width / 2; x < this.width / 2; x += skipCount) {
            for (let y = -this.width / 2; y < this.width / 2; y += skipCount) {
                for (let z = -this.width / 2; z < this.width / 2; z += skipCount) {
                    let v = vf.evaluate(x, y, z)
                    let arrow = this.drawVector(new Vector(x, y, z), v.multiplyScalar(1 / maxValue), color)
                    arrow.scale.x = 5
                    arrow.scale.z = 5

                }
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update()
        this.renderer.render(this.scene, this.camera);
    }
}