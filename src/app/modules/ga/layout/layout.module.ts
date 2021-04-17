import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from '@shared'

const COMPONENTS = []

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, SharedModule],
  exports: [...COMPONENTS],
})
export class LayoutModule {}
