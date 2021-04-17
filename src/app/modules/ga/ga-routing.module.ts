import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { GaComponent } from './ga.component'

const routes: Routes = [
  {
    path: '',
    component: GaComponent,
  },
  {
    path: 'ga-etps/:etpsid',
    // component: ,
  },
  { path: '**', redirectTo: '' },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GaRoutingModule {}
