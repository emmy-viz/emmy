export declare class Vector {
    d: number[];
    constructor(x: any, y: any, z: number);
    add(b: Vector): Vector;
    sub(b: Vector): Vector;
    multiplyScalar(b: number): Vector;
    dotProduct(b: Vector): number;
    crossProduct(b: Vector): Vector;
    magnitude(): number;
    angle(b: Vector): number;
}
