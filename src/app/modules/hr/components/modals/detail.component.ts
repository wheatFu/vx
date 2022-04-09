import { Component, Input, OnInit } from '@angular/core'
import { ChangeResData } from '../../interfaces/hr.model'
@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.less'],
})
export class DetailComponent implements OnInit {
  @Input() data: ChangeResData
  @Input() changeType: string
  constructor() {}
  ngOnInit() {}
}
