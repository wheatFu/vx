import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'
import { PositionRoutingModule } from './position-routing.module'
import { PositionService } from './service/position.service'
import { InfoComponent } from './info/info.component'
import { DictionariesComponent } from './dictionaries/dictionaries.component'
import { ComponentsModule } from '../organization/components/components.module'
import { EditInfoComponent } from './edit/edit-info.component'
import { PositionComponent } from './position.component'
import { SharedComponentsModule } from '@shared/components/components.module'
@NgModule({
  declarations: [InfoComponent, DictionariesComponent, EditInfoComponent, PositionComponent],
  providers: [PositionService],
  imports: [
    CommonModule,
    PositionRoutingModule,
    SharedModule,
    ComponentsModule,
    SharedComponentsModule,
  ],
})
export class PositionModule {}
