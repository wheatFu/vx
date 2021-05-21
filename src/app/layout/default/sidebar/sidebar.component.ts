import { Component, ChangeDetectionStrategy } from '@angular/core'
import { SettingsService } from '@knz/theme'

@Component({
  selector: 'layout-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  constructor(public settings: SettingsService) {}
}
