import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { RouterModule } from '@angular/router'
import { VxPaginationModule } from './pagination/pagination.module'
import { DelModalComponent } from './del-modal/del-modal.component'
import { TreeGraphComponent } from '@shared/components/graph/tree-graph.component'
import { SearchInputComponent } from './search-input/search-input.component'

import { FormsModule } from '@angular/forms'
import { VxTableComponent } from './vx-table/vx-table.component'

const COMPONENTS = [DelModalComponent, TreeGraphComponent, SearchInputComponent, VxTableComponent]

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, NgZorroAntdModule, RouterModule, VxPaginationModule, FormsModule],
  exports: [...COMPONENTS, VxPaginationModule],
  entryComponents: [DelModalComponent],
})
export class SharedComponentsModule {}
