import { Component, OnInit } from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import { SceneService } from 'src/app/services/scene.service';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styles: [
  ]
})
export class ToolboxComponent implements OnInit {

  currentTab = "Components"
  tabNames = ["Components", "Scene", "About", "Examples"]

  constructor(private stateService: StateService, private sceneService: SceneService) { }

  ngOnInit(): void {
  }

  dirty() {
    this.stateService.dirty()
  }

}
