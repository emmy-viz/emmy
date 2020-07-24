import { Func } from "./func";
import { VectorField } from "./vector_field";

export function gradient(f: Func): VectorField {
    return new VectorField(f.derivative("x"), f.derivative("y"), f.derivative("z"))
}

export function divergence(v: VectorField): Func {
    return new Func("0")
        .add(v.x().derivative("x"))
        .add(v.y().derivative("y"))
        .add(v.z().derivative("z"))
}

export function curl(v: VectorField): VectorField {
    let x = v.z().derivative("y").sub(v.y().derivative("z"))
    let y = v.x().derivative("z").sub(v.z().derivative("x"))
    let z = v.y().derivative("x").sub(v.x().derivative("y"))
    return new VectorField(x, y, z)
}

export function laplacian(f: Func): Func {
    return divergence(gradient(f))
}