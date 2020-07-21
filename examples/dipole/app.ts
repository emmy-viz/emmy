import * as viz from "../../src/viz/viz"
import { Sim } from "../../src/sim/sim"
import { Vector } from "../../src/vector";
import { VectorField } from "../../src/vector_field";
import { Func } from "../../src/func"
import { curl } from "../../src/operators"

let canvas_dipole = document.getElementById("canvas_dipole") as HTMLCanvasElement
var v = new viz.Viz(canvas_dipole);

let sim = new Sim()

var positive = new Vector(0, -5, 0)
var negative = new Vector(0, 5, 0)

sim.addPoint(positive, 10)
sim.addPoint(negative, -10)

// v.drawVectorField(sim.E(), 0xFFFFFF, 2)
v.drawSphere(positive, 0x0000ff)
v.drawSphere(negative, 0xff0000)
v.drawTestPoints(sim.E())