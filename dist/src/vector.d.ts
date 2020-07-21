export declare class Vector {
    d: number[];
    constructor(x: number, y: number, z: number);
    x(): number;
    y(): number;
    z(): number;
    add(b: Vector): Vector;
    sub(b: Vector): Vector;
    multiplyScalar(b: number): Vector;
    dotProduct(b: Vector): number;
    crossProduct(b: Vector): Vector;
    magnitude(): number;
    angleRadians(b: Vector): number;
    unit(): Vector;
    valueOf(): number[];
    toObject(): object;
    perpendicular(b: Vector): Vector;
}
