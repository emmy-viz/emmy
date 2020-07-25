import { Vector } from "../calc/vector";
import { VectorField } from "../calc/vector_field";
import { Func } from "../calc/func";
import { Point } from "./shapes"

export class Simulation {

    points: Point[]

    previousE: VectorField
    isDirty: boolean
    wasDirty: boolean

    constructor() {
        this.points = []
        this.isDirty = true
    }

    addPoint(position: Vector, q: number) {
        this.points.push(new Point(position, q))
        this.isDirty = true
    }

    E(): VectorField {
        if (!this.isDirty) {
            return this.previousE
        }

        this.isDirty = false
        this.wasDirty = true

        let out = new VectorField(new Func("0"), new Func("0"), new Func('0'))
        for (let p of this.points) {
            out = out.add(p.E())
        }
        this.previousE = out
        return out
    }
}