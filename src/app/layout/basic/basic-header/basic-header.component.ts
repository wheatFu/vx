import { Component, OnInit } from '@angular/core'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'basic-header',
  template: `
    <div class="knz-default__nav-wrap">
      <ul class="knz-default__nav"></ul>
      <ul class="knz-default__nav">
        <li class="hidden-mobile">
          <header-theme></header-theme>
        </li>
        <li class="hidden-mobile">
          <header-i18n></header-i18n>
        </li>
        <li class="hidden-mobile">
          <header-user></header-user>
        </li>
      </ul>
    </div>
  `,
})
export class BasicHeaderComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
