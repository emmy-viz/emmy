
import { Vector } from './vector';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;

describe('vector class', () => {

    it('should be able to add', () => {
        let v1 = new Vector(1, 2, 3)
        let v2 = new Vector(5, 6, 7)

        expect(v1.add(v2).d).to.eqls([6, 8, 10])
    });

    it("should subtract", () => {
        let v1 = new Vector(1, 2, 3)
        let v2 = new Vector(10, 9, 8)

        expect(v2.sub(v1).d).to.eqls([9, 7, 5]);
    });

    it("should dot product", () => {
        let v1 = new Vector(1, 0, 1);
        let v2 = new Vector(0, 1, 1);

        expect(v1.dotProduct(v2)).eqls(v2.dotProduct(v1))
        expect(v2.dotProduct(v1)).to.equals(1)
    })

    it("should return angles", () => {
        let v1 = new Vector(1, 0, 1);
        let v2 = new Vector(0, 1, 1);

        expect(v2.angleRadians(v1)).to.be.closeTo(Math.PI / 3, .0001);
    })

    it("should take cross product", () => {
        let v1 = new Vector(1, 2, 3)
        let v2 = new Vector(10, 9, 8)
        let solution = v1.magnitude() * v2.magnitude() * Math.sin(v1.angleRadians(v2))

        expect(v1.crossProduct(v2).magnitude()).to.be.closeTo(solution, .0001);
        expect(v1.crossProduct(v1).magnitude()).to.be.equals(0)
    })

    it('should respect basic rules', () => {
        let v1 = new Vector(1, 2, 3)
        let v2 = new Vector(10, 9, 8)
        let v3 = new Vector(10, 8, 4)

        let v4a = v1.dotProduct(v2.crossProduct(v3))
        let v4b = v1.crossProduct(v2).dotProduct(v3)
        expect(v4a).to.equal(v4b)
    })

    it("should respect BAC_CAB", () => {
        let v1 = new Vector(1, 2, 3)
        let v2 = new Vector(10, 9, 8)
        let v3 = new Vector(10, 8, 4)

        let v4a = v1.crossProduct(v2.crossProduct(v3))
        let v4b = v2.multiplyScalar(v1.dotProduct(v3)).sub(
            v3.multiplyScalar(v1.dotProduct(v2)))

        expect(v4a.d).to.eqls(v4b.d)
    })
});
