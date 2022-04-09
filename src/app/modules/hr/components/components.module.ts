import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from '@shared'
import { DetailComponent } from './modals/detail.component'

const COMPONENTS = [DetailComponent]
@NgModule({
  declarations: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS],
  imports: [CommonModule, SharedModule],
})
export class HrComponentsModule {}
