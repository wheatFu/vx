import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TdEllipsisDirective } from './td-ellipsis/td-ellipsis.directive'

@NgModule({
  declarations: [TdEllipsisDirective],
  imports: [CommonModule],
  exports: [TdEllipsisDirective],
})
export class DirectiveModule {}
