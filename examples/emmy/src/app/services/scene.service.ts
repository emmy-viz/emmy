import { Injectable } from '@angular/core';
import { Visualization } from "../../../../../src/visualization/visualization"
import { Simulation } from "../../../../../src/simulation/simulation"
import { Vector } from "../../../../../src/calc/vector"

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
    new Scene("dipole", "A static positive and negative charge.", null, null)
  ]

  constructor() {
  }

  loadScene(name: string, c: HTMLCanvasElement): Scene {

    if (name == "dipole") {
      return this.loadDipoleScene(c)
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
    // visualization_dipole.drawTestPoints()
    visualization_dipole.isDrawEVectorField = true
    visualization_dipole.isDrawETestPoints = true

    visualization_dipole.drawEFieldLines()

    let out = new Scene("dipole", description, visualization_dipole, sim_dipole)
    return out
  }
}


