import { Component } from '@angular/core'
import { SettingsService } from '@knz/theme'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'basic-sidebar',
  templateUrl: './basic-sidebar.component.html',
  styleUrls: ['./basic-sidebar.component.less'],
})
export class BasicSidebarComponent {
  searchToggleStatus: boolean

  constructor(public settings: SettingsService) {}

  toggleCollapsedSidebar() {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed)
  }

  searchToggleChange() {
    this.searchToggleStatus = !this.searchToggleStatus
  }
}
