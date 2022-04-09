import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SharedModule } from '@shared'
import { EnableModalComponent } from './enable-modal/enable-modal.component'
import { ChangeDetailModalComponent } from './change-detail-modal/change-detail-modal.component'
import { GridDetaiModalComponent } from './grid-detai-modal/grid-detai-modal.component'
const COMPONENTS = [EnableModalComponent, ChangeDetailModalComponent, GridDetaiModalComponent]

@NgModule({
  declarations: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
  exports: [...COMPONENTS],
  imports: [CommonModule, SharedModule],
})
export class ModalsModule {}
