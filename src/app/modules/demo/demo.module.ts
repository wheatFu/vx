import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DemoComponent } from './demo.component'
import { RouterModule } from '@angular/router'
import { SharedModule } from '@shared'

const routes = [
  {
    path: '',
    component: DemoComponent,
  },
]
@NgModule({
  declarations: [DemoComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class DemoModule {}
