import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'
import { HolidayRoutingModule } from './holiday-routing.module'
import { HolidayComponent } from './holiday.component'
import { HolidayService } from './service/holiday.service'
import { SharedComponentsModule } from '@shared/components/components.module'
import { ListComponent } from './items/list/list.component'
import { EditComponent } from './items/edit/edit.component'
import { QuotaComponent } from './quota/quota.component'

const OTC_COMONENTS = []

@NgModule({
  declarations: [HolidayComponent, ListComponent, EditComponent, QuotaComponent],
  entryComponents: [...OTC_COMONENTS],
  providers: [HolidayService],
  imports: [CommonModule, HolidayRoutingModule, SharedModule, SharedComponentsModule],
})
export class HolidayModule {}
