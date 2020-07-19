
export class Vector {
    d: number[]

    constructor(x: number, y: number, z: number) {
        this.d = [x, y, z];
    }

    x(): number {
        return this.d[0]
    }

    y(): number {
        return this.d[1]
    }

    z(): number {
        return this.d[2];
    }

    add(b: Vector): Vector {
        return new Vector(this.d[0] + b.d[0], this.d[1] + b.d[1], this.d[2] + b.d[2])
    }

    sub(b: Vector): Vector {
        return new Vector(this.d[0] - b.d[0], this.d[1] - b.d[1], this.d[2] - b.d[2])
    }

    multiplyScalar(b: number): Vector {
        return new Vector(this.d[0] * b, this.d[1] * b, this.d[2] * b)
    }

    dotProduct(b: Vector): number {
        return this.d[0] * b.d[0] +
            this.d[1] * b.d[1] +
            this.d[2] * b.d[2]
    }

    crossProduct(b: Vector): Vector {
        return new Vector(
            this.d[1] * b.d[2] - this.d[2] * b.d[1],
            this.d[2] * b.d[0] - this.d[0] * b.d[2],
            this.d[0] * b.d[1] - this.d[1] * b.d[0]
        )
    }

    magnitude(): number {
        return Math.sqrt(this.d[0] * this.d[0] +
            this.d[1] * this.d[1] +
            this.d[2] * this.d[2])
    }

    angleRadians(b: Vector): number {
        let out = this.dotProduct(b)
        out /= (this.magnitude() * b.magnitude())
        return Math.abs(Math.acos(out));
    }

    unit(): Vector {
        let m = this.magnitude()
        return this.multiplyScalar(1 / m)
    }

    valueOf(): number[] {
        return this.d
    }

    toObject(): object {
        return { "x": this.x(), "y": this.y(), "z": this.z() }
    }

    perpendicular(b: Vector): Vector {
        return this.crossProduct(b).unit()
    }
}


