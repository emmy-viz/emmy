import { Func } from "./func";
import { VectorField } from "./vector_field";
import { Vector } from "./vector";


// Make sure this is cuberoot-able
let N = 1000

// simpson
export function integrate(f: Func, symbol: string, a: number, b: number): number {
    let h = (b - a) / N

    let sum = 0
    let scope = {}

    scope[symbol] = a
    sum += f.evaluate(scope)

    scope[symbol] = b
    sum += f.evaluate(scope)

    for (let i = 1; i < N; i++) {
        let x = a + i * h
        scope[symbol] = x

        if (i % 2 == 1) {
            sum += 4 * f.evaluate(scope)
        } else {
            sum += 2 * f.evaluate(scope)
        }
    }

    sum *= h / 3
    return sum
}

// simpson
export function integrate_line(A: VectorField, a: Vector, b: Vector): number {
    let h = (b.sub(a)).multiplyScalar(1 / N)
    let sum = A.evaluate(a.x(), a.y(), a.z()).dotProduct(h)
    sum += A.evaluate(b.x(), b.y(), b.z()).dotProduct(h)

    for (let i = 1; i < N; i++) {
        let x = a.add(h.multiplyScalar(i))

        if (i % 2 == 1) {
            sum += 4 * A.evaluate(x.x(), x.y(), x.z()).dotProduct(h)
        } else {
            sum += 2 * A.evaluate(x.x(), x.y(), x.z()).dotProduct(h)
        }
    }

    sum /= 3
    return sum
}

export function integrate_path(A: VectorField, path: Vector[]): number {
    let out = 0;
    for (let i = 0; i < path.length - 1; i++) {
        out += integrate_line(A, path[i], path[i + 1])
    }
    return out
}


// center
export function integrate_surface(A: VectorField, tl: Vector, tr: Vector, br: Vector) {
    var top = tr.sub(tl)
    var right = br.sub(tr)
    var dw = top.multiplyScalar(1 / Math.sqrt(N));
    var dh = right.multiplyScalar(1 / Math.sqrt(N));

    var area = dw.magnitude() * dh.magnitude()
    var perp = right.perpendicular(top).multiplyScalar(area)

    let sum = 0;
    for (let w = 0; w < Math.sqrt(N); w++) {
        for (let h = 0; h < Math.sqrt(N); h++) {
            let pos = tl.add(dw.multiplyScalar(w + .5)).add(dh.multiplyScalar(h + .5))
            sum += A.evaluate(pos.x(), pos.y(), pos.z()).dotProduct(perp)
        }
    }

    return sum
}

export function integrate_surface_cube(A: VectorField, c1: Vector, c2: Vector) {
    let width = c2.x() - c1.x()
    let height = c2.y() - c1.y()
    let depth = c2.z() - c1.z()

    let bbl = c1
    let bbr = bbl.add(new Vector(width, 0, 0))
    let btl = bbl.add(new Vector(0, height, 0))
    let btr = bbl.add(new Vector(width, height, 0))

    let fbl = bbl.add(new Vector(0, 0, depth))
    let fbr = bbl.add(new Vector(width, 0, depth))
    let ftl = bbl.add(new Vector(0, height, depth))
    let ftr = bbl.add(new Vector(width, height, depth))

    // (tl, tr, br)
    N /= 6
    let out = 0
    out += integrate_surface(A, ftl, ftr, fbr) //front
    out += integrate_surface(A, btr, btl, bbl) //back 
    out += integrate_surface(A, ftr, btr, bbr) //right
    out += integrate_surface(A, btl, ftl, fbl) //left
    out += integrate_surface(A, btl, btr, ftr) //top
    out += integrate_surface(A, fbl, fbr, bbr) //bottom
    N *= 6

    return out
}

// center
export function integrate_volume_cube(F: Func, c1: Vector, c2: Vector): number {
    let delta = c2.sub(c1).multiplyScalar(1 / Math.cbrt(N));
    let area = delta.x() * delta.y() * delta.z()

    let out = 0
    for (let x = 0; x < Math.cbrt(N); x++) {
        for (let y = 0; y < Math.cbrt(N); y++) {
            for (let z = 0; z < Math.cbrt(N); z++) {
                let v = new Vector(c1.x() + delta.x() * (x + .5),
                    c1.y() + delta.y() * (y + .5),
                    c1.z() + delta.z() * (z + .5))

                out += F.evaluate(v.toObject())
            }
        }
    }
    out *= area
    return out
}