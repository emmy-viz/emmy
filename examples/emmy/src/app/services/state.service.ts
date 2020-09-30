import { Injectable } from '@angular/core';
import { Visualization } from "../../../../../src/visualization/visualization"
import { Simulation } from "../../../../../src/simulation/simulation"
import { Vector } from "../../../../../src/calc/vector"
import { SceneService } from "./scene.service"
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  visualization: Visualization
  sim: Simulation

  constructor(private sceneService: SceneService, private route: ActivatedRoute) {
    this.visualization = {} as Visualization
    this.sim = {} as Simulation
  }

  dirty() {
    this.sim.isDirty = true
  }

  init() {
    let canvas = document.getElementById("emmy_canvas") as HTMLCanvasElement

    var urlParams = new URLSearchParams(window.location.search);
    var sceneName = urlParams.get("scene")

    if (sceneName == "" || !sceneName) {
      sceneName = "motion"
    }

    let s = this.sceneService.loadScene(sceneName, canvas)
    this.visualization = s.visualization
    this.sim = s.sim
  }

  load(name: string) {
    let canvas = document.getElementById("emmy_canvas") as HTMLCanvasElement

    this.visualization.destroy()

    let s = this.sceneService.loadScene(name, canvas)
    this.visualization = s.visualization
    this.sim = s.sim
  }
}
