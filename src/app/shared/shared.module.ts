import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// vx
import { KNZThemeModule } from '@knz/theme';
import { KNZAssemblyModule } from '@knz/assembly';
import { KNZChartModule } from '@knz/chart';
import { KNZRoleModule } from '@knz/role';
import { KNZFormModule } from '@knz/form';
// i18n
import { TranslateModule } from '@ngx-translate/core';

// #region third libs
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CountdownModule } from 'ngx-countdown';
import { UEditorModule } from 'ngx-ueditor';
import { NgxTinymceModule } from 'ngx-tinymce'; 

   
const COMPONENTS_Chart =[
  
];

const THIRDMODULES = [NgZorroAntdModule,
  CountdownModule,
  UEditorModule,
  NgxTinymceModule
];
// #endregion

// #region your componets & directives
const COMPONENTS = [ 
];


const DIRECTIVES = [];
// #endregion


const PIPES = [
  
];


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
    ...THIRDMODULES
  ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    ...COMPONENTS_Chart,
  ],
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
    ...THIRDMODULES,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES, 
    ...COMPONENTS_Chart
  ],
  providers:[
  ]
})
export class SharedModule { }
