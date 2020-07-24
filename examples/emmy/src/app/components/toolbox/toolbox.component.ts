import { Component, OnInit } from '@angular/core';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styles: [
  ]
})
export class ToolboxComponent implements OnInit {

  currentTab = "Components"
  tabNames = ["Components", "Scene", "About"]

  constructor(private stateService: StateService) { }

  ngOnInit(): void {
  }

  dirty() {
    this.stateService.dirty()
  }

}
