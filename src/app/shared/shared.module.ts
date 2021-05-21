import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
// vx
import { KNZThemeModule } from '@knz/theme'
import { KNZAssemblyModule } from '@knz/assembly'
import { KNZChartModule } from '@knz/chart'
import { KNZRoleModule } from '@knz/role'
import { KNZFormModule } from '@knz/form'

// 中台统一组件
import { KnxVuiModule } from 'knx-vui'
// i18n
import { TranslateModule } from '@ngx-translate/core'

// #region third libs
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { CountdownModule } from 'ngx-countdown'
import { UEditorModule } from 'ngx-ueditor'
import { NgxTinymceModule } from 'ngx-tinymce'
import { SharedComponentsModule } from './components/components.module'
import { OrgStatePipe, OrgChangeTypePipe, BoolePipePipe } from './pipes/index'

const COMPONENTS_Chart = []

const THIRDMODULES = [NgZorroAntdModule, CountdownModule, UEditorModule, NgxTinymceModule]
// #endregion

// #region your componets & directives
const COMPONENTS = []

const DIRECTIVES = []
// #endregion

const PIPES = [OrgStatePipe, OrgChangeTypePipe, BoolePipePipe]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    KNZThemeModule.forChild(),
    KNZAssemblyModule,
    KNZChartModule,
    KNZRoleModule,
    KNZFormModule,
    SharedComponentsModule,
    KnxVuiModule,
    ...THIRDMODULES,
  ],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES, ...COMPONENTS_Chart],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    KNZThemeModule,
    KNZAssemblyModule,
    KNZChartModule,
    KNZRoleModule,
    KNZFormModule,
    TranslateModule,
    SharedComponentsModule,
    KnxVuiModule,
    ...THIRDMODULES,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    ...COMPONENTS_Chart,
  ],
  providers: [],
})
export class SharedModule {}
