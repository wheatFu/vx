import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { EditComponent } from './edit/edit.component'
import { InfoComponent } from './info/info.component'
import { OrganizationComponent } from './organization.component'
import { ChangeComponent } from './change/change.component'
import { NotEffectComponent } from './not-effect/not-effect.component'
import { ChangeHistoryComponent } from './change-history/change-history.component'
import { MergeComponent } from './merge/merge.component'
const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent,
    data: {
      breadcrumb: '组织管理',
    },
    children: [
      {
        path: 'info', // 组织信息
        component: InfoComponent,
      },
      {
        path: 'edit', // 编辑/变更/新增
        component: EditComponent,
      },
      {
        path: 'merge/:id', // 合并
        component: MergeComponent,
      },
      {
        path: 'noteffect', // 未生效组织
        component: NotEffectComponent,
      },
      {
        path: 'change-history/:id', // 变更历史
        component: ChangeHistoryComponent,
      },
      {
        path: 'change', // 变更查询
        component: ChangeComponent,
      },
    ],
  },

  { path: '**', redirectTo: '' },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationRoutingModule {}
