import { Func } from "./func";
import { VectorField } from "./vector_field";
import { Vector } from "./vector";
export declare function integrate(f: Func, symbol: string, a: number, b: number): number;
export declare function integrate_line(A: VectorField, a: Vector, b: Vector): number;
export declare function integrate_path(A: VectorField, path: Vector[]): number;
export declare function integrate_surface(A: VectorField, tl: Vector, tr: Vector, br: Vector): number;
export declare function integrate_surface_cube(A: VectorField, c1: Vector, c2: Vector): number;
export declare function integrate_volume_cube(F: Func, c1: Vector, c2: Vector): number;
