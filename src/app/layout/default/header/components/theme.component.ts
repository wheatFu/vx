import { DOCUMENT } from '@angular/common'
import { Component, Inject } from '@angular/core'

@Component({
  selector: 'header-theme',
  template: `
    <div class="knz-default__nav-item" nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click" nzPlacement="bottomRight">
      <i nz-icon nzType="setting" nzTheme="outline"></i>
    </div>

    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li
          nz-menu-item
          *ngFor="let item of themes"
          [nzSelected]="item.code === curThemeCode"
          (click)="change(item.code)"
        >
          {{ item.text }}
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
})
export class ThemeComponent {
  get themes() {
    return [
      {
        code: 'default',
        text: 'Default Theme',
      },
      {
        code: 'basic',
        text: 'Basic Theme',
      },
    ]
  }

  get curThemeCode() {
    return localStorage.getItem('theme') || 'default'
  }

  constructor(@Inject(DOCUMENT) private doc: any) {}

  change(theme: string) {
    if (theme === this.curThemeCode) {
      return
    }
    const spinEl = this.doc.createElement('div')
    spinEl.setAttribute('class', `page-loading ant-spin ant-spin-lg ant-spin-spinning`)
    spinEl.innerHTML = `<span class="ant-spin-dot ant-spin-dot-spin"><i></i><i></i><i></i><i></i></span>`
    this.doc.body.appendChild(spinEl)

    localStorage.setItem('theme', theme)
    setTimeout(() => this.doc.location.reload())
  }
}
