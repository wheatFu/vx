import { NgModule } from '@angular/core'

import { SharedModule } from '@shared'
import { RouteRoutingModule } from './routes-routing.module'

import { HomeComponent } from './home/home.component'
import { LoginComponent } from './auth/login/index.component'

const COMPONENTS = [HomeComponent, LoginComponent]
const COMPONENTS_NOROUNT = []

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class RoutesModule {}
