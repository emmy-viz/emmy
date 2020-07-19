"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = void 0;
class Vector {
    constructor(x, y, z) {
        this.d = [x, y, z];
    }
    add(b) {
        return new Vector(this.d[0] + b.d[0], this.d[1] + b.d[1], this.d[2] + b.d[2]);
    }
    sub(b) {
        return new Vector(this.d[0] - b.d[0], this.d[1] - b.d[1], this.d[2] - b.d[2]);
    }
    multiplyScalar(b) {
        return new Vector(this.d[0] * b, this.d[1] * b, this.d[2] * b);
    }
    dotProduct(b) {
        return this.d[0] * b.d[0] +
            this.d[1] * b.d[1] +
            this.d[2] * b.d[2];
    }
    crossProduct(b) {
        return new Vector(this.d[1] * b.d[2] - this.d[2] * b.d[1], this.d[2] * b.d[0] - this.d[0] * b.d[2], this.d[0] * b.d[1] - this.d[1] * b.d[0]);
    }
    magnitude() {
        return this.d[0] * this.d[0] +
            this.d[1] * this.d[1] +
            this.d[2] * this.d[2];
    }
    angle(b) {
        let out = this.dotProduct(b);
        out /= (this.magnitude() * b.magnitude());
        return Math.acos(out);
    }
}
exports.Vector = Vector;
