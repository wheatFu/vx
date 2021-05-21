import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { PaginationComponent } from './pagination.component'

@NgModule({
  declarations: [PaginationComponent],
  exports: [PaginationComponent],
  imports: [CommonModule, FormsModule, NgZorroAntdModule],
})
export class VxPaginationModule {}
