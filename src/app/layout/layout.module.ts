import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { LayoutDefaultComponent } from './default/default.component';
import { LayoutSettingComponent } from './setting/setting.component';
import { HeaderComponent } from './default/header/header.component';
import { SidebarComponent } from './default/sidebar/sidebar.component';
import { SidebarSettingComponent } from './setting/sidebar/sidebar.component';
import { HeaderI18nComponent } from './default/header/components/i18n.component';
import { HeaderUserComponent } from './default/header/components/user.component';

import { SettingDrawerComponent } from './default/setting-drawer/setting-drawer.component';
import { SettingDrawerItemComponent } from './default/setting-drawer/setting-drawer-item.component';

const SETTINGDRAWER = [SettingDrawerComponent, SettingDrawerItemComponent];
const COMPONENTS = [
  LayoutDefaultComponent,
  LayoutSettingComponent,
  HeaderComponent,
  SidebarComponent,
  SidebarSettingComponent,
  ...SETTINGDRAWER,
];

const HEADERCOMPONENTS = [
  HeaderI18nComponent,
  HeaderUserComponent,
];

// passport
import { LayoutPassportComponent } from './passport/passport.component';
const PASSPORT = [LayoutPassportComponent];

@NgModule({
  imports: [SharedModule],
  entryComponents: SETTINGDRAWER,
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS, ...PASSPORT],
  exports: [...COMPONENTS, ...PASSPORT],
})
export class LayoutModule {}
