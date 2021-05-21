import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CustomTreeComponent } from './custom-tree/custom-tree.component'
import { SharedModule } from '@shared'
import { OrgGraphComponent } from './org-graph/org-graph.component'

const COMPONENTS = [CustomTreeComponent, OrgGraphComponent]

@NgModule({
  declarations: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS],
  imports: [CommonModule, SharedModule],
})
export class ComponentsModule {}
