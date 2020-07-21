import { Func } from "./func";
import { VectorField } from "./vector_field";
export declare function gradient(f: Func): VectorField;
export declare function divergence(v: VectorField): Func;
export declare function curl(v: VectorField): VectorField;
export declare function laplacian(f: Func): Func;
