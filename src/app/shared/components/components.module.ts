import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component'
import { RouterModule } from '@angular/router'
import { VxPaginationModule } from './pagination/pagination.module'

const COMPONENTS = [BreadcrumbComponent]

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, NgZorroAntdModule, RouterModule, VxPaginationModule],
  exports: [...COMPONENTS, VxPaginationModule],
  entryComponents: [],
})
export class SharedComponentsModule {}
