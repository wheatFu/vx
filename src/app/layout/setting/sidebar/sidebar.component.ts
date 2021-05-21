import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '@knz/theme';

@Component({
  selector: 'layout-sidebar-setting',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarSettingComponent {
  constructor(public settings: SettingsService) {}
}
