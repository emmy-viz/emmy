import { Func } from "./func";
import { Vector } from "./vector";
export declare class VectorField {
    d: Func[];
    constructor(x: Func, y: Func, z: Func);
    x(): Func;
    y(): Func;
    z(): Func;
    evaluate(x: number, y: number, z: number): Vector;
    multiply(f: Func): VectorField;
    add(f: VectorField): VectorField;
    dotProduct(b: VectorField): Func;
    crossProduct(b: VectorField): VectorField;
}
