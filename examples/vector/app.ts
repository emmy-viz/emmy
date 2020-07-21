import * as viz from "../../src/viz/viz"
import { Vector } from "../../src/vector";
import { VectorField } from "../../src/vector_field";
import { Func } from "../../src/func"
import { curl } from "../../src/operators"

let canvas_add = document.getElementById("canvas_add") as HTMLCanvasElement

var v = new viz.Viz(canvas_add);

var origin = new Vector(0, 0, 0)
var a = new Vector(3, 3, 4);
var b = new Vector(4, 1, 0);
var c = a.add(b)

var a_color = 0x0000ff
var b_color = 0x00ff00
var c_color = 0xff0000

v.drawVector(origin, a, a_color)
v.drawVector(origin, b, b_color)
v.drawVector(origin, c, c_color)

v.drawVector(a, b, b_color)
v.drawVector(b, a, a_color)

// dot product
let canvas_dotproduct = document.getElementById("canvas_dotproduct") as HTMLCanvasElement
let v_dotproduct = new viz.Viz(canvas_dotproduct)

var dotproduct = a.dotProduct(b)
v_dotproduct.drawVector(origin, a, a_color)
v_dotproduct.drawVector(origin, c, b_color)

// cross product
let canvas_crossproduct = document.getElementById("canvas_crossproduct") as HTMLCanvasElement
let viz_crossproduct = new viz.Viz(canvas_crossproduct)

viz_crossproduct.drawVector(origin, a, a_color)
viz_crossproduct.drawVector(origin, b, b_color)
viz_crossproduct.drawVector(origin, a.crossProduct(b), c_color)

// vector field 
let vf1 = new VectorField(new Func("x* y"), new Func("x"), new Func("0"))
let canvas_vf1 = document.getElementById("canvas_vf1") as HTMLCanvasElement
let viz_vf1 = new viz.Viz(canvas_vf1);

viz_vf1.drawVectorField(vf1)
viz_vf1.drawVectorField(curl(vf1), 0x00ff00)