import * as chai from 'chai';
const expect = chai.expect;

import { Vector } from './vector';
import { Func } from "./func"
import { VectorField } from './vector_field';
import { integrate, integrate_line, integrate_path, integrate_surface } from "./integrals"

describe("integrator", () => {
    it("should integrate", () => {
        let f = new Func("5")
        expect(integrate(f, "x", 0, 1)).equals(5)

        let f2 = new Func("x^2")
        expect(integrate(f2, "x", 0, 5)).to.closeTo(125 / 3, .0001)
        expect(integrate(new Func("cos(x)"), "x", 0, 2 * Math.PI)).to.closeTo(0, .0001)
        expect(integrate(new Func("sin(x)"), "x", 0, 2 * Math.PI)).to.closeTo(0, .0001)
    })

    it("should line integrate", () => {
        let A = new VectorField(new Func("y^2"), new Func("2 * x * (y+1)"), new Func("0"))
        let a = new Vector(1, 1, 0)
        let b = new Vector(2, 1, 0)
        let c = new Vector(2, 2, 0)

        expect(integrate_line(A, a, b)).to.closeTo(1, .000001)
        expect(integrate_line(A, b, c)).to.closeTo(10, .000001)
        expect(integrate_line(A, a, c)).to.closeTo(10, .000001)
        expect(integrate_path(A, [a, b, c])).to.closeTo(11, .00001)
    })

    it("should surface integrate", () => {
        let A = new VectorField(new Func("2 * x * z"), new Func("x+2"), new Func("y * (z^2 - 3)"))

        let tl = new Vector(2, 0, 2)
        let tr = new Vector(2, 2, 2)
        let br = new Vector(2, 2, 0)

        expect(integrate_surface(A, tl, tr, br)).to.closeTo(16, .2)
    })
})