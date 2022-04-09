import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'

import { LayoutDefaultComponent } from './default/default.component'
import { LayoutSettingComponent } from './setting/setting.component'
import { HeaderComponent } from './default/header/header.component'
import { SidebarComponent } from './default/sidebar/sidebar.component'
import { SidebarSettingComponent } from './setting/sidebar/sidebar.component'
import { BasicComponent } from './basic/basic.component'
import { BasicSidebarComponent } from './basic/basic-sidebar/basic-sidebar.component'
import { BasicHeaderComponent } from './basic/basic-header/basic-header.component'
import { HeaderI18nComponent } from './default/header/components/i18n.component'
import { HeaderUserComponent } from './default/header/components/user.component'

import { SettingDrawerComponent } from './default/setting-drawer/setting-drawer.component'
import { SettingDrawerItemComponent } from './default/setting-drawer/setting-drawer-item.component'

const SETTINGDRAWER = [SettingDrawerComponent, SettingDrawerItemComponent, BasicComponent, LayoutDefaultComponent]
const COMPONENTS = [
  LayoutDefaultComponent,
  LayoutSettingComponent,
  HeaderComponent,
  SidebarComponent,
  SidebarSettingComponent,
  BasicComponent,
  BasicSidebarComponent,
  BasicHeaderComponent,
  ...SETTINGDRAWER,
]

const HEADERCOMPONENTS = [HeaderI18nComponent, HeaderUserComponent, ThemeComponent]

// passport
import { LayoutPassportComponent } from './passport/passport.component'
import { ThemeComponent } from './default/header/components/theme.component'
import { LayoutThemeComponent } from './layout-theme.component'

const PASSPORT = [LayoutPassportComponent]

@NgModule({
  imports: [SharedModule],
  entryComponents: SETTINGDRAWER,
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS, ...PASSPORT, LayoutThemeComponent],
  exports: [...COMPONENTS, ...PASSPORT],
})
export class LayoutModule {}
