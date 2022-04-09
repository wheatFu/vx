import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-hr',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class HrComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
