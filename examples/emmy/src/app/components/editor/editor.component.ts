import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StateService } from "../../services/state.service"

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styles: ["canvas:focus {outline:none;}"
  ]
})
export class EditorComponent implements OnInit {
  @ViewChild('emmy_canvas') canvas: ElementRef;
  @ViewChild("container") container: ElementRef;

  width: number
  height: number

  constructor(private stateService: StateService) {
    this.width = 150;
    this.height = 150;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.resize()
    this.stateService.init()
    this.stateService.viz.resize(this.container.nativeElement.offsetWidth, this.container.nativeElement.offsetHeight)
  }

  resize(): void {
    let height = this.container.nativeElement.offsetHeight;
    let width = this.container.nativeElement.offsetWidth;
    document.getElementById("emmy_canvas").style.height = height + "px";
    document.getElementById("emmy_canvas").style.width = width + "px";
  }
}
