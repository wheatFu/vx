import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'
import { ComponentsModule } from './components/components.module'
import { OrganizationRoutingModule } from './organization-routing.module'
import { OrganizationComponent } from './organization.component'
import { OrganizationService } from './service/organization.service'
import { InfoComponent } from './info/info.component'
import { ChangeComponent } from './change/change.component'
import { EditComponent } from './edit/edit.component'
import { NotEffectComponent } from './not-effect/not-effect.component'
import { ChangeHistoryComponent } from './change-history/change-history.component'
import { ModalsModule } from './modals/modals.module'
import { MergeComponent } from './merge/merge.component'
import { SharedComponentsModule } from '@shared/components/components.module'

const OTC_COMONENTS = []

@NgModule({
  declarations: [
    OrganizationComponent,
    InfoComponent,
    ChangeComponent,
    EditComponent,
    MergeComponent,
    NotEffectComponent,
    ChangeHistoryComponent,
  ],
  entryComponents: [...OTC_COMONENTS],
  providers: [OrganizationService],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    SharedModule,
    ComponentsModule,
    ModalsModule,
    SharedComponentsModule,
  ],
})
export class OrganizationModule {}
