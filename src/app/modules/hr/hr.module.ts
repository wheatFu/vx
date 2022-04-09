import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HrComponent } from './hr.component'
import { SharedModule } from '@shared'
import { SharedComponentsModule } from '@shared/components/components.module'
import { HrService } from './service/hr.service'
import { HrRoutingModule } from './hr-routing.module'
import { EntryComponent } from './entry/entry.component'
import { InServiceComponent } from './inservice/inservicecomponent'
import { OperationComponent } from './operation/operation.component'
import { RelationGraphComponent } from './relation-graph/relation-graph.component'
import { StaffHistoryComponent } from './staff-history/staff-history.component'
import { HrComponentsModule } from './components/components.module'
import { HrEditComponent } from './hr-edit/hr-edit.component'
import { EmployeeInfoComponent } from './hr-edit/employee-info/employee-info.component'
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component'
import { DismissComponent } from './dismiss/dismiss.component'
import { HistoryComponent } from './history/history.component'
import { HrEditService } from './hr-edit/hr-edit.service'
import { ResignInfoComponent } from './hr-edit/resign-info/resign-info.component'
import { TransferInfoComponent } from './hr-edit/transfer-info/transfer-info.component'

@NgModule({
  declarations: [
    HrComponent,
    EntryComponent,
    HrEditComponent,
    InServiceComponent,
    OperationComponent,
    RelationGraphComponent,
    StaffHistoryComponent,
    DismissComponent,
    HistoryComponent,
    EmployeeInfoComponent,
    DynamicFormComponent,
    ResignInfoComponent,
    TransferInfoComponent,
  ],
  imports: [CommonModule, HrRoutingModule, SharedModule, SharedComponentsModule, HrComponentsModule],
  providers: [HrService, HrEditService],
})
export class HrModule {}
