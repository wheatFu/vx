import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { environment } from '@env/environment'
import { EmployeeData, GENDER_MAP_DEFAULT_AVATAR } from '../interfaces/hr.model'
import { HrService } from '../service/hr.service'
import { parseQueryParam } from '../../../utils/utils'
import { Router } from '@angular/router'
import { NzMessageService } from 'ng-zorro-antd'
import { TreeSourceOpts } from '../../organization/interfaces/organization.model'
interface GraphTab {
  name: string
  id: string
  selected?: boolean
}
let _parse_query
let _id_map_graph_data
@Component({
  selector: 'app-relation-graph',
  templateUrl: './relation-graph.component.html',
  styleUrls: ['./relation-graph.component.less'],
})
export class RelationGraphComponent implements OnInit, OnChanges {
  employInfo: EmployeeData
  graphTabs: GraphTab[] = []
  hasPositionGraphData: boolean
  hasPersonnelGraphData: boolean
  positionGraphSource: TreeSourceOpts
  personnelGraphSource: TreeSourceOpts
  toggleUI = 'A'
  constructor(private hrService: HrService, private router: Router, private msg: NzMessageService) {}
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit() {
    _parse_query = parseQueryParam(this.router.url)
    this.getEmployeeInfo(_parse_query.id)
    this.getPersonnelChartData(_parse_query.id)
  }
  getPositionChartData(id) {
    this.hrService.getPositionReportChartById(id).subscribe(resp => {
      const { result, data } = resp
      this.graphTabs = []
      if (+result.code === 0) {
        this.positionGraphSource = { ...data[0], zoom: 50 } || {} // 默认显示第一个职位架构图数据,
        this.hasPositionGraphData = Object.keys(this.positionGraphSource).length > 1
        _id_map_graph_data = data.reduce((prev, next) => {
          prev[next.positionId] = { ...next, zoom: 50 } // 每个数据源都有一个缩放比例字段，用于存储切换tab时，各个图表的缩放到了多少比例
          return prev
        }, {})
        while (data.length) {
          const item = data.shift()
          this.graphTabs.push({ name: item.positionName, id: item.positionId })
        }
        this.graphTabs = this.graphTabs.map((item, index) => ({ ...item, selected: +index === 0 }))
      } else {
        this.msg.warning(result.message)
      }
    })
  }
  getPersonnelChartData(id) {
    this.hrService.getPersonnelReportChartById(id).subscribe(resp => {
      const { result, data } = resp
      if (+result.code === 0) {
        this.personnelGraphSource = { ...data[0], zoom: 50 } || {}
        this.hasPersonnelGraphData = Object.keys(this.personnelGraphSource).length > 1
      } else {
        this.msg.warning(result.message)
      }
    })
  }
  getEmployeeInfo(id) {
    this.hrService.getEmployeeInfo(...arguments).subscribe(resp => {
      const { result, data } = resp
      if (+result.code === 0) {
        this.employInfo = {
          ...data,
          profile: data.profile
            ? `${environment.SERVER_URL}/file/www/${data.profile}`
            : GENDER_MAP_DEFAULT_AVATAR[data.gender],
        }
      } else {
        this.msg.warning(result.message)
      }
    })
  }
  toggle(toggle: string) {
    this.toggleUI = toggle
    if (toggle === 'B') {
      if (this.positionGraphSource) return
      this.getPositionChartData(_parse_query.id)
    }
  }
  toggleTab(id: string) {
    this.positionGraphSource = _id_map_graph_data[id] || {}
  }
  handleZoom({ zoom, id }) {
    if(!id) return
    _id_map_graph_data[id].zoom = zoom
  }
}
