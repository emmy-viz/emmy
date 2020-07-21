import { Vector } from "../vector";
import { VectorField } from "../vector_field";
import { Func } from "../func";

export class Sim {

    points: Point[]

    testPoint: Point[]


    constructor() {
        this.points = []
    }

    addPoint(position: Vector, q: number) {
        this.points.push(new Point(position, q))
    }

    E(): VectorField {
        let out = new VectorField(new Func("0"), new Func("0"), new Func('0'))
        for (let p of this.points) {
            out = out.add(p.E())
        }
        return out
    }
}

export class Point {
    position: Vector
    q: number

    constructor(position: Vector, q: number) {
        this.position = position
        this.q = q
    }

    E(): VectorField {
        let r = "((x-" + this.position.x() + ")^2 + (y- " + this.position.y() + ")^2 + (z-" + this.position.z() + ")^2)"

        let x = (" (" + this.q + " * (x- " + this.position.x() + ") )  / (" + r + ")^(3/2)")
        let y = (" (" + this.q + " * (y- " + this.position.y() + ") )  / (" + r + ")^(3/2)")
        let z = (" (" + this.q + " * (z- " + this.position.z() + ") )  / (" + r + ")^(3/2)")

        console.log(x)
        return new VectorField(new Func(x), new Func(y), new Func(z))
    }
}
