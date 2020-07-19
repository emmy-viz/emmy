
import { Vector } from './vector';

import * as mocha from 'mocha';
import * as chai from 'chai';
import { Func } from './func';

const expect = chai.expect;

describe("func", () => {
    it('should be solvable', () => {
        let f = new Func("3x^2 + 5")

        expect(f.evaluate({ x: 1 })).to.be.equals(8)
        expect(f.evaluate({ x: 2 })).to.be.equals(17)
    })

    it('should be differentiable', () => {
        let f = new Func("3x^2 + 5")

        let dfdx = f.derivative("x")
        expect(dfdx.evaluate({ x: 5 })).to.be.equal(30)
    })


    it('should be add two expressions', () => {
        let f1 = new Func("3x^2 + 5")
        let f2 = new Func("5x^3 + 6x^2 + x")
        let scope = { x: 15 }

        let sum = f1.add(f2)
        expect(sum.evaluate(scope)).to.be.equal(f1.evaluate(scope) + f2.evaluate(scope))
    })
})