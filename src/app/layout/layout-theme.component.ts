import { Component, OnInit } from '@angular/core'
import { BasicComponent } from './basic/basic.component'
import { LayoutDefaultComponent } from './default/default.component'

@Component({
  selector: 'app-layout-theme',
  template: `
    <ng-container *ngComponentOutlet="comp"></ng-container>
  `,
})
export class LayoutThemeComponent implements OnInit {
  constructor() {}
  // defult = BasicComponent
  comp: any
  ngOnInit() {
    const theme = localStorage.getItem('theme') as 'default' | 'basic'

    this.comp = theme === 'default' ? LayoutDefaultComponent : BasicComponent
  }
}
