import { Vector } from "../calc/vector";
import { VectorField } from "../calc/vector_field";
import { Func } from "../calc/func";

let ID = 0

export class Point {
    name: string

    position: Vector
    velocity: Vector

    force: Vector

    charge: number

    isFixed: boolean
    mass: number

    constructor(position: Vector, q: number) {
        this.position = position
        this.charge = q
        this.name = "point_" + ID
        this.velocity = new Vector(0, 0, 0)
        this.force = new Vector(0, 0, 0)
        this.mass = 1
        ID++
    }

    // charge() {
    //     if (!Number.isFinite(this.q)) {
    //         return 0
    //     }
    //     return this.q
    // }

    E(): VectorField {
        let charge = this.charge
        if (!Number.isFinite(this.charge)) {
            charge = 0
        }

        let r = "((x-" + this.position.x() + ")^2 + (y- " + this.position.y() + ")^2 + (z-" + this.position.z() + ")^2)"

        let x = (" (" + charge + " * (x- " + this.position.x() + ") )  / (" + r + ")^(3/2)")
        let y = (" (" + charge + " * (y- " + this.position.y() + ") )  / (" + r + ")^(3/2)")
        let z = (" (" + charge + " * (z- " + this.position.z() + ") )  / (" + r + ")^(3/2)")

        return new VectorField(new Func(x), new Func(y), new Func(z))
    }
}
