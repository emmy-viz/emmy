import * as viz from "../../src/viz/viz"
import { Simulation } from "../../src/sim/sim"
import { Vector } from "../../src/calc/vector";

let canvas_dipole = document.getElementById("canvas_dipole") as HTMLCanvasElement
var v = new viz.Viz(canvas_dipole);

let sim = new Simulation()

var positive = new Vector(0, -5, 0)
var negative = new Vector(0, 5, 0)

sim.addPoint(positive, 10)
sim.addPoint(negative, -10)

// v.drawVectorField(sim.E(), 0xFFFFFF, 2)
v.drawSphere(positive, 0x0000ff)
v.drawSphere(negative, 0xff0000)
v.drawTestPoints(sim.E())