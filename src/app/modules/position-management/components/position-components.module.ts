import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from '@shared'
import { PositionGraphComponent } from './graph/position-graph.component'

const COMPONENTS = [PositionGraphComponent]

@NgModule({
  declarations: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS],
  imports: [CommonModule, SharedModule],
})
export class PositionComponentsModule {}
