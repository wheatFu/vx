import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'
import { PositionManagementRoutingModule } from './position-management-routing.module'
import { PositionManagementService } from './service/position-management.service'
import { InfoComponent } from './info/info.component'
import { DictionariesComponent } from './dictionaries/dictionaries.component'
import { ComponentsModule } from '../organization/components/components.module'
import { EditInfoComponent } from './edit/edit-info.component'
import { PositionManagementComponent } from './position-management.component'
import { PositionComponentsModule } from './components/position-components.module'
import { SharedComponentsModule } from '@shared/components/components.module'
@NgModule({
  declarations: [InfoComponent, DictionariesComponent, EditInfoComponent, PositionManagementComponent],
  providers: [PositionManagementService],
  imports: [
    CommonModule,
    PositionManagementRoutingModule,
    SharedModule,
    ComponentsModule,
    PositionComponentsModule,
    SharedComponentsModule,
  ],
})
export class PositionManagementModule {}
