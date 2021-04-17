import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@shared'
import { ComponentsModule } from './components/components.module'
import { GaRoutingModule } from './ga-routing.module'
import { GaComponent } from './ga.component'
import { LayoutModule } from './layout/layout.module'
import { GaService } from './service/ga.service'

const MOCK_MODULES = []
// const MOCK_MODULES = [KNZMockModule.forRoot({ data: MOCKDATA })];

const OTC_COMONENTS = []

@NgModule({
  declarations: [GaComponent],
  entryComponents: [...OTC_COMONENTS],
  providers: [GaService],
  imports: [CommonModule, GaRoutingModule, SharedModule, ComponentsModule, LayoutModule, ...MOCK_MODULES],
})
export class GaModule {}
