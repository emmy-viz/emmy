import { Vector } from "../calc/vector";
import { VectorField } from "../calc/vector_field";
import { Func } from "../calc/func";
import { Point } from "./shapes"

export class Simulation {

    points: Point[]
    e_fields: VectorField[]
    b_fields: VectorField[]

    previousE: VectorField
    isDirty: boolean
    wasDirty: boolean

    stepNumber: number

    isActive: boolean

    damp = .2

    constructor() {
        this.points = []
        this.isDirty = true
        this.stepNumber = 0
        this.e_fields = []
        this.b_fields = []
        this.isActive = false
    }

    addPoint(position: Vector, q: number) {
        this.points.push(new Point(position, q))
        this.isDirty = true
        this.wasDirty = true
    }

    step(dt: number) {
        for (let p of this.points) {
            let eField = new VectorField(new Func("0"), new Func("0"), new Func('0'))
            for (let b of this.points) {
                if (p.name != b.name)
                    eField = eField.add(b.E())
            }
            for (let f of this.e_fields) {
                eField = eField.add(f)
            }

            let bField = this.B()
            // console.log(eField.evaluate(-5, 5, 0).z())
            // console.log("Start", p.name, p.charge, p.mass, dt)
            // console.log("force", p.force.x(), p.force.y(), p.force.z())
            // console.log("Position", p.position.x(), p.position.y(), p.position.z())
            // console.log("Velocity", p.velocity.x(), p.velocity.y(), p.velocity.z())

            let evaluation = eField.evaluate(p.position.x(), p.position.y(), p.position.z())
            // console.log("Evaluation", evaluation.x(), evaluation.y(), evaluation.z())

            p.force.set(evaluation.multiplyScalar(p.charge))
            // console.log("p.force before bfield", p.force.x(), p.force.y(), p.force.z())
            p.force = p.force.add(p.velocity.crossProduct(bField.evaluate(p.position.x(), p.position.y(), p.position.z())).multiplyScalar(p.charge))
            // console.log("p.force after b.field", p.force.x(), p.force.y(), p.force.z())
            // console.log(bField.evaluate(0, 0, 0), p.velocity.crossProduct(new Vector(0, 0, 1)))

            let acceleration = p.force.multiplyScalar((1.0 - this.damp) / p.mass)
            p.velocity.set(p.velocity.add(acceleration.multiplyScalar(dt)))
            p.position.set(p.position.add(p.velocity.multiplyScalar(dt)))

            // console.log("END", p.name, p.charge, p.mass)
            // console.log("force", p.force.x(), p.force.y(), p.force.z())
            // console.log("Position", p.position.x(), p.position.y(), p.position.z())
            // console.log("Velocity", p.velocity.x(), p.velocity.y(), p.velocity.z())
            // console.log("Acceleration", acceleration.x(), acceleration.y(), acceleration.z())
            // // p.position = p.position.add(eField.evaluate(p.position.x(), p.position.y(), p.position.z())).multiplyScalar(p.charge)
        }
        this.stepNumber++
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
        for (let f of this.e_fields) {
            out = out.add(f)
        }

        this.previousE = out
        return out
    }

    B_static(): VectorField {
        let out = new VectorField(new Func("0"), new Func("0"), new Func("0"))
        for (let f of this.b_fields) {
            out = out.add(f)
        }
        return out
    }

    B(): VectorField {
        let out = new VectorField(new Func("0"), new Func("0"), new Func("0"))
        for (let f of this.b_fields) {
            out = out.add(f)
        }
        return out
    }



    E_static(): VectorField {
        let out = new VectorField(new Func("0"), new Func("0"), new Func("0"))
        for (let f of this.e_fields) {
            out = out.add(f)
        }
        return out
    }

    positiveObjects(): Point[] {
        let out = []
        for (let p of this.points) {
            if (p.charge > 0) {
                out.push(p)
            }
        }
        return out
    }
}