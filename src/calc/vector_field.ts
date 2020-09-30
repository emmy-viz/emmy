import { Func } from "./func"
import { Vector } from "./vector"

export class VectorField {
    d: Func[]

    constructor(x: Func, y: Func, z: Func) {
        this.d = [x, y, z]
    }

    x(): Func {
        return this.d[0]
    }

    y(): Func {
        return this.d[1]
    }

    z(): Func {
        return this.d[2]
    }

    evaluateMemo = {}
    evaluate(x: number, y: number, z: number): Vector {
        let key = "" + x + "," + y + "," + z
        let scope = { x: x, y: y, z: z }
        if (key in this.evaluateMemo) {
            let solution = this.evaluateMemo[key]
            return solution
        }

        let solution = new Vector(this.d[0].evaluate(scope), this.d[1].evaluate(scope), this.d[2].evaluate(scope))
        this.evaluateMemo[key] = new Vector(solution.x(), solution.y(), solution.z())
        return solution
    }

    multiply(f: Func): VectorField {
        return new VectorField(
            this.x().multiply(f),
            this.y().multiply(f),
            this.z().multiply(f))
    }


    add(f: VectorField): VectorField {
        return new VectorField(
            this.x().add(f.x()),
            this.y().add(f.y()),
            this.z().add(f.z()))
    }

    dotProduct(b: VectorField): Func {
        let x = this.d[0].multiply(b.d[0])
        let y = this.d[1].multiply(b.d[1])
        let z = this.d[2].multiply(b.d[2])
        return x.add(y).add(z)
    }

    crossProduct(b: VectorField): VectorField {
        return new VectorField(
            this.d[1].multiply(b.d[2]).sub(this.d[2].multiply(b.d[1])),
            this.d[2].multiply(b.d[0]).sub(this.d[0].multiply(b.d[2])),
            this.d[0].multiply(b.d[1]).sub(this.d[1].multiply(b.d[0]))
        )
    }
}
