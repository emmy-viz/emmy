import { Injectable } from '@angular/core';
import { Viz } from "../../../../../src/viz/viz"
import { Simulation } from "../../../../../src/sim/sim"
import { Vector } from "../../../../../src/calc/vector"

export class Scene {
  viz: Viz
  sim: Simulation
}

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  constructor() {

  }

  loadDipoleScene(c: HTMLCanvasElement): Scene {
    var sim_dipole = new Simulation()
    let viz_dipole = new Viz(c, sim_dipole)

    var positive = new Vector(-5, 5, 0)
    var negative = new Vector(5, 5, 0)
    sim_dipole.addPoint(positive, 10)
    sim_dipole.addPoint(negative, -10)
    viz_dipole.drawTestPoints()

    let out = new Scene()
    out.viz = viz_dipole;
    out.sim = sim_dipole
    return out
  }
}


