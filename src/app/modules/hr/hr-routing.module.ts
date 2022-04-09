import { NgModule } from '@angular/core'
import { HrComponent } from './hr.component'
import { RouterModule, Routes } from '@angular/router'
import { EntryComponent } from './entry/entry.component'
import { HrEditComponent } from './hr-edit/hr-edit.component'
import { EmployeeInfoComponent } from './hr-edit/employee-info/employee-info.component'
import { InServiceComponent } from './inservice/inservicecomponent'
import { OperationComponent } from './operation/operation.component'
import { RelationGraphComponent } from './relation-graph/relation-graph.component'
import { StaffHistoryComponent } from './staff-history/staff-history.component'
import { DismissComponent } from './dismiss/dismiss.component'
import { HistoryComponent } from './history/history.component'
import { ResignInfoComponent } from './hr-edit/resign-info/resign-info.component'
import { TransferInfoComponent } from './hr-edit/transfer-info/transfer-info.component'
const routes: Routes = [
  {
    path: '',
    component: HrComponent,
    children: [
      {
        path: 'entry', // 入职
        component: EntryComponent,
      },
      {
        path: 'edit', // 新增/编辑
        component: HrEditComponent,
        children: [
          { path: 'org_employee', component: EmployeeInfoComponent }, // 员工基本信息
          { path: 'vx_employee_trial', component: EmployeeInfoComponent }, // 试用期信息
          { path: 'vx_employee_resign', component: ResignInfoComponent }, // 员工离职信息
          { path: 'vx_employee_regular', component: ResignInfoComponent }, // 员工转正信息
          { path: 'vx_employee_transfer', component: TransferInfoComponent }, // 员工调动信息
          { path: '', redirectTo: 'org_employee' },
        ],
      },
      {
        path: 'inservice', // 在职员工
        component: InServiceComponent,
      },
      {
        path: 'behavior',
        component: OperationComponent,
      },
      {
        path: 'relation-graph', // 员工关系图
        component: RelationGraphComponent,
      },
      {
        path: 'staff-history', // 员工历史
        component: StaffHistoryComponent,
      },
      {
        path: 'dismiss',
        component: DismissComponent,
      },
      {
        path: 'history',
        component: HistoryComponent,
      },
    ],
  },

  { path: '**', redirectTo: '' },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrRoutingModule {}
