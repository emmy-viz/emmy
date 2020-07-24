import { Simulation } from "../sim/sim";

function sync(scene: THREE.Scene, sim: Simulation) {





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