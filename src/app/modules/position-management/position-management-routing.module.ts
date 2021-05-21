import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { InfoComponent } from './info/info.component'
import { DictionariesComponent } from './dictionaries/dictionaries.component'
import { EditInfoComponent } from './edit/edit-info.component'
import { PositionManagementComponent } from './position-management.component'
const routes: Routes = [
  {
    path: '',
    component: PositionManagementComponent,
    data: {
      breadcrumb: '职位管理',
    },
    children: [
      {
        path: 'info',
        component: InfoComponent,
        data: {
          breadcrumb: '职位信息',
        }
      },
      {
        path: 'edit',
        component: EditInfoComponent,
        data: {
          breadcrumb: '编辑职位',
        }
      },
      {
        path: 'dict',
        component: DictionariesComponent,
        data: {
          breadcrumb: '职位字典',
        }
      },
    ],
  },
  // {
  //   path: 'info',
  //   component: InfoComponent,
  //   data: {
  //     breadcrumb: '职位信息',
  //   },
  // },
  // {
  //   path: 'edit',
  //   component: EditInfoComponent,
  // },
  // {
  //   path: 'dict',
  //   component: DictionariesComponent,
  //   data: {
  //     breadcrumb: '职位字典',
  //   },
  // },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PositionManagementRoutingModule {}
