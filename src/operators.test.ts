
import { Vector } from './vector';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
import { Func } from "./func"
import { gradient, divergence, curl } from "./operators"
import { VectorField } from './vector_field';
import { format } from 'mathjs';

describe("operators", () => {
    it("should take gradients", () => {
        let f = new Func("x^2 + y^3 + z^4")
        let gF = gradient(f)

        expect(gF.x().evaluate({ x: 5 })).to.be.equal(10)
        expect(gF.y().evaluate({ y: 10 })).to.be.equals(300)
    })


    it("should take divergence", () => {
        let f = new VectorField(
            new Func("y ^ 2"),
            new Func("2 x y + z^2"),
            new Func("2 y z"))

        let f_divergence = divergence(f)

        expect(f_divergence.evaluate({ x: 3, y: 5 })).to.be.equal(16)
    })

    it("should take the curl", () => {
        let f = new VectorField(
            new Func("-y"),
            new Func("x"),
            new Func("0")
        )

        let f_curl = curl(f)

        expect(f_curl.evaluate(0, 0, 0).z()).to.equal(2)
    })

    it("should respect common identities", () => {
        var f = new Func("12x^2 + 13y^3 + z")
        var g = new Func("x y z")

        var s1 = gradient(f.multiply(g))
        var s2 = gradient(g).multiply(f).add(gradient(f).multiply(g))

        expect(s1.evaluate(4, 3, 1).d).to.be.eqls(s2.evaluate(4, 3, 1).d)
    })

    it("should respect more advance identities", () => {
        var A = new VectorField(new Func("5y"), new Func("2x"), new Func("12*z*y"))
        var B = new VectorField(new Func("3 x * y"), new Func("1"), new Func("x"))

        var s1 = divergence(A.crossProduct(B))
        let s2 = B.dotProduct(curl(A)).sub(A.dotProduct(curl(B)))

        expect(s1.evaluate({ x: 4, y: 3, z: 1 })).to.be.equal(s2.evaluate({ x: 4, y: 3, z: 1 }))
    })
})