import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HolidayComponent } from './holiday.component'
import { ListComponent } from './items/list/list.component'
import { EditComponent } from './items/edit/edit.component'
import { QuotaComponent } from './quota/quota.component'

const routes: Routes = [
  {
    path: '',
    component: HolidayComponent,
    data: {
      breadcrumb: '休假管理',
    },
    children: [
      {
        path: 'items', // 休假项目
        component: ListComponent,
      },
      {
        path: 'scheme-setting', // 休假方案设置
        component: HolidayComponent,
      },
      {
        path: 'quota', // 休假额度
        component: QuotaComponent,
      },
      {
        path: 'employee-holiday-detail', // 员工休假明细
        component: HolidayComponent,
      },
      {
        path: 'items-edit', // 休假项目 -》 编辑
        component: EditComponent,
      },
    ],
  },

  { path: '**', redirectTo: '' },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HolidayRoutingModule {}
