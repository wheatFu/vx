/**
 * 进一步对基础模块的导入提炼 
 */
import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { throwIfAlreadyLoaded } from '@core';

import { KNZThemeModule } from '@knz/theme';
import { KNZRoleModule } from '@knz/role';

// #region mock
import { KNZMockModule } from '@knz/mock';
import * as MOCKDATA from '../../_mock';
import { environment } from '@env/environment';
// const MOCK_MODULES = !environment.production ? [VXMockModule.forRoot({ data: MOCKDATA })] : [];
const MOCK_MODULES = [KNZMockModule.forRoot({ data: MOCKDATA })];
// #endregion
 
import { RouteReuseStrategy } from '@angular/router';
import { ReuseTabService, ReuseTabStrategy } from '@knz/assembly/reuse-tab';
const REUSETAB_PROVIDES = [
  
]; 

import { PageHeaderConfig } from '@knz/assembly';
export function fnPageHeaderConfig(): PageHeaderConfig {
  return {
    ...new PageHeaderConfig(),
    homeI18n: 'home',
  };
}

import { KNZAuthConfig } from '@knz/auth';
export function fnVXAuthConfig(): KNZAuthConfig {
  return {
    ...new KNZAuthConfig(),
    login_url: '/auth/login',
  };
}

// tslint:disable-next-line: no-duplicate-imports
import { STConfig } from '@knz/assembly';
export function fnSTConfig(): STConfig {
  return {
    ...new STConfig(),
    modal: { size: 'lg' },
  };
}

const GLOBAL_CONFIG_PROVIDES = [
  // TIPS：@knz/abc 有大量的全局配置信息，例如设置所有 `st` 的页码默认为 `20` 行
  { provide: STConfig, useFactory: fnSTConfig },
  { provide: PageHeaderConfig, useFactory: fnPageHeaderConfig },
  { provide: KNZAuthConfig, useFactory: fnVXAuthConfig },
];

// #endregion

@NgModule({
  imports: [KNZThemeModule.forRoot(), KNZRoleModule.forRoot(), ...MOCK_MODULES],
})
export class VXModule {
  constructor(@Optional() @SkipSelf() parentModule: VXModule) {
    throwIfAlreadyLoaded(parentModule, 'VXModule');
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: VXModule,
      providers: [...REUSETAB_PROVIDES, ...GLOBAL_CONFIG_PROVIDES],
    };
  }
}
