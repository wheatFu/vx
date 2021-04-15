import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SimpleGuard } from '@knz/auth';
import { environment } from '@env/environment';
// layout
import { LayoutDefaultComponent } from '../layout/default/default.component';  
import { LayoutPassportComponent } from '../layout/passport/passport.component';

import { LoginComponent } from './auth/login/index.component'; 
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  // 登录相关
  {
    path: 'auth',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: '登录', titleI18n: 'app.login.login' },
      }
    ]
  },
  {
    path: '',
    component: LayoutDefaultComponent,
    canActivate: [SimpleGuard],
    canActivateChild: [SimpleGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'index', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, data: { title: '首页', titleI18n: '首页' } }
    ],
  }
];

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
