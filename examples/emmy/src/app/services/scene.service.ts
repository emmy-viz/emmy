import { Injectable } from '@angular/core';
import { Visualization } from "../../../../../src/visualization/visualization"
import { Simulation } from "../../../../../src/simulation/simulation"
import { Vector } from "../../../../../src/calc/vector"
import { VectorField } from '../../../../../src/calc/vector_field';
import { Func } from '../../../../../src/calc/func';

export class Scene {
  name: string
  description: string

  visualization: Visualization
  sim: Simulation

  constructor(n, d, v, s) {
    this.name = n; this.description = d; this.visualization = v; this.sim = s;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  scenes = [
    new Scene("blank", "A blank canvas.", null, null),
    new Scene("dipole", "A static positive and negative charge.", null, null),
    new Scene("trap", "A particle trapped in a box of charges", null, null),
    new Scene("motion", "A particle under the effect of magnetic and electric fields", null, null)
  ]

  constructor() {
  }

  loadScene(name: string, c: HTMLCanvasElement): Scene {

    if (name == "dipole") {
      return this.loadDipoleScene(c)
    }

    if (name == "trap") {
      return this.loadBoxTrap(c)
    }

    if (name == "motion") {
      return this.loadChargedMotion(c)
    }


    if (name == "blank") {
      return this.loadBlankScene(c)
    }

    console.error("Not a valid scene name", name)
    alert("not a valid scene name")
    return this.loadBlankScene(c)
  }

  loadBlankScene(c: HTMLCanvasElement): Scene {
    let s = new Simulation()
    let v = new Visualization(c, s)
    let description = "An empty canvas."
    return new Scene("blank", description, v, s)
  }

  loadDipoleScene(c: HTMLCanvasElement): Scene {
    var sim_dipole = new Simulation()
    let visualization_dipole = new Visualization(c, sim_dipole)
    let description = "A static positive and negative charge."

    var positive = new Vector(-5, 5, 0)
    var negative = new Vector(5, 5, 0)
    sim_dipole.addPoint(positive, 10)
    sim_dipole.addPoint(negative, -10)
    visualization_dipole.drawTestPoints()
    visualization_dipole.isDrawEVectorField = true
    visualization_dipole.isDrawETestPoints = true
    visualization_dipole.isDrawEFieldLines = true
    visualization_dipole.camera.position.y = 20
    visualization_dipole.camera.position.z = 20


    visualization_dipole.drawVectorField(sim_dipole.B(), 0x0000FF, "b_vector_field", .1)

    let out = new Scene("dipole", description, visualization_dipole, sim_dipole)
    return out
  }

  loadChargedMotion(c: HTMLCanvasElement): Scene {
    var sim_charged = new Simulation()
    let vis_charged = new Visualization(c, sim_charged)
    let description = "A charge under the influence of electric and magnetic fields."

    sim_charged.addPoint(new Vector(-10, 0, 0), 1)
    sim_charged.e_fields.push(new VectorField(new Func("0"), new Func("2"), new Func("0")))
    sim_charged.b_fields.push(new VectorField(new Func("0"), new Func("0"), new Func("2")))

    vis_charged.isDrawEVectorField = true
    vis_charged.isDrawBVectorField = true
    vis_charged.isDrawGrid = true

    vis_charged.isRotateScene = false
    sim_charged.isActive = true

    return new Scene("motion", description, vis_charged, sim_charged)
  }

  loadBoxTrap(c: HTMLCanvasElement): Scene {
    let sim_trap = new Simulation()
    let visualization = new Visualization(c, sim_trap)
    let description = "A particle trapped in a box of charges"

    sim_trap.addPoint(new Vector(5, 5, 5), 10)
    sim_trap.addPoint(new Vector(5, 5, -5), 10)
    sim_trap.addPoint(new Vector(5, -5, 5), 10)
    sim_trap.addPoint(new Vector(5, -5, -5), 10)
    sim_trap.addPoint(new Vector(-5, 5, 5), 10)
    sim_trap.addPoint(new Vector(-5, 5, -5), 10)
    sim_trap.addPoint(new Vector(-5, -5, 5), 10)
    sim_trap.addPoint(new Vector(-5, -5, -5), 10)

    sim_trap.addPoint(new Vector(0, 0, 0), 10)

    visualization.isDrawEFieldLines = true

    let out = new Scene("trap", description, visualization, sim_trap)
    return out
  }
}