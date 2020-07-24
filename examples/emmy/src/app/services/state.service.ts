import { Injectable } from '@angular/core';
import { Viz } from "../../../../../src/viz/viz"
import { Simulation } from "../../../../../src/sim/sim"
import { Vector } from "../../../../../src/calc/vector"
import { SceneService } from "./scene.service"

@Injectable({
  providedIn: 'root'
})
export class StateService {

  viz: Viz
  sim: Simulation

  constructor(private sceneService: SceneService) {
    this.viz = {} as Viz
    this.sim = {} as Simulation
  }

  dirty() {
    this.sim.isDirty = true
  }

  init() {
    let canvas_dipole = document.getElementById("emmy_canvas") as HTMLCanvasElement

    let s = this.sceneService.loadDipoleScene(canvas_dipole)
    this.viz = s.viz
    this.sim = s.sim
  }
}
