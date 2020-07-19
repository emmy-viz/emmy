"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
const chai = require("chai");
const expect = chai.expect;
describe('vector class', () => {
    it('should be able to add', () => {
        let v1 = new vector_1.Vector(1, 2, 3);
        let v2 = new vector_1.Vector(5, 6, 7);
        expect(v1.add(v2).d).to.eqls([6, 8, 10]);
    });
    it("should subtract", () => {
        let v1 = new vector_1.Vector(1, 2, 3);
        let v2 = new vector_1.Vector(10, 9, 8);
        expect(v2.sub(v1)).to.eqls([9, 7, 5]);
    });
    it("should dot product", () => {
        let v1 = new vector_1.Vector(1, 0, 1);
        let v2 = new vector_1.Vector(0, 1, 1);
        expect(v1.dotProduct(v2)).eqls(v2.dotProduct(v1));
        expect(v2.dotProduct(v1)).to.equals(1);
    });
    it("should return angles", () => {
        let v1 = new vector_1.Vector(1, 0, 1);
        let v2 = new vector_1.Vector(0, 1, 1);
        expect(v1.angle(v2)).to.equals(60);
    });
});
