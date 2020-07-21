import { Vector } from "../vector";
import { VectorField } from "../vector_field";
export declare class Sim {
    points: Point[];
    testPoint: Point[];
    constructor();
    addPoint(position: Vector, q: number): void;
    E(): VectorField;
}
export declare class Point {
    position: Vector;
    q: number;
    constructor(position: Vector, q: number);
    E(): VectorField;
}
