import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { SimpleGuard } from '@knz/auth'
import { environment } from '@env/environment'
// layout
import { LayoutPassportComponent } from '../layout/passport/passport.component'

import { LoginComponent } from './auth/login/index.component'
import { HomeComponent } from './home/home.component'
import { KnxJumpingComponent } from 'knx-ngx/jumping'
import { KnxAuthChildGuard, KnxUserInfoGuard } from 'knx-ngx/core'
import { LayoutThemeComponent } from '../layout/layout-theme.component'

const routes: Routes = [
  // { path: 'jumping', component: KnxJumpingComponent },
  // 登录相关
  {
    path: 'auth',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: '登录', titleI18n: 'app.login.login' },
      },
    ],
  },
  {
    path: '',
    component: LayoutThemeComponent,
    canActivate: [], //  SimpleGuard
    canActivateChild: [], // SimpleGuard
    children: [
      { path: '', redirectTo: 'auth/login', pathMatch: 'full', data: {} },
      { path: 'index', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, data: { title: '首页', titleI18n: '首页' } },
      {
        path: 'organization', // 组织管理
        loadChildren: () => import('./organization/organization.module').then(m => m.OrganizationModule),
      },
      {
        path: 'position', // 职位
        loadChildren: () => import('./position/position.module').then(m => m.PositionModule),
      },
      {
        path: 'hr', // 人事管理
        loadChildren: () => import('./hr/hr.module').then(m => m.HrModule),
      },
      {
        path: 'holiday', // 休假管理
        loadChildren: () => import('./holiday/holiday.module').then(m => m.HolidayModule),
      },
    ],
  },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class RouteRoutingModule {}
