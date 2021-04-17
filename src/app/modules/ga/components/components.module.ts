import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

const COMPONENTS = []

@NgModule({
  declarations: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS],
  imports: [CommonModule],
})
export class ComponentsModule {}
