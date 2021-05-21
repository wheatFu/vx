import { Component, Input, OnInit } from '@angular/core'
import { ChangeResData, CHANGE_TYPE_MAP_CHINESE, ORG_TYPE } from '../../interfaces/organization.model'

@Component({
  selector: 'app-change-detail-modal',
  templateUrl: './change-detail-modal.component.html',
  styleUrls: ['./change-detail-modal.component.less'],
})
export class ChangeDetailModalComponent implements OnInit {
  @Input() dat: ChangeResData
  @Input() changeType: string
  org_type = ORG_TYPE
  change_type = CHANGE_TYPE_MAP_CHINESE
  data: ChangeResData

  ngOnInit() {
    this.data = this.dat
  }
}
