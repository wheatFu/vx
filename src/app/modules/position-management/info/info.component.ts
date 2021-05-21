import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { PositionManagementService } from '../service/position-management.service'
import { Router, ActivatedRoute } from '@angular/router'
import { TreeSourceOpts, DataState } from '../../organization/interfaces/organization.model'
import PerfectScrollbar from 'perfect-scrollbar'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'
import { NzMessageService, NzTreeNode } from 'ng-zorro-antd'
import { downLoadFile } from '../../../utils/utils'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
interface GraphTab {
  name: string
  id: string
}
let _id_map_graph_data = {}
let positionId =''
@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.less'],
})
export class InfoComponent implements OnInit, AfterViewInit, OnDestroy {
  isRelated = null
  levelCount = -1
  list = [{ value: -1, label: '展开全部' }]
  // 临时数据
  toggleUI = 'A'
  // table
  scrollbar: PerfectScrollbar
  tableScroll = { y: '500px' }
  tableClientHeight: number
  listdata: any[] = []
  pageState = DataState.LOADING
  totalcount = 0
  pagesize = 20
  pageindex = 1
  employeeScrollbar: PerfectScrollbar
  employeeListData: any[] = []
  employeeTotalCount = 0
  employeePageSize = 20
  employPageIndex = 1
  query = ''
  organizationId = ''
  selectedTableItem: any
  // tree
  nodeOpts: TreeSourceOpts
  // 流程图数据源
  graphSource: TreeSourceOpts
  graphTabs: GraphTab[] = []
  positionId: string
  isEnableVisible: boolean
  isDeleteVisible: boolean
  isEmployeeListVisible: boolean
  hasGraphData: boolean
  constructor(
    private elementRef: ElementRef,
    private changeDel: ChangeDetectorRef,
    private pmService: PositionManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService,
  ) {}
  @ViewChild('tableWarp', { static: false }) elementView: ElementRef
  ngOnInit() {
    this.pmService
      .isRelatedOrganization()
      .pipe(
        switchMap(resp => {
          const { data: isRelatedOrganization } = resp
          this.isRelated = isRelatedOrganization
          return of(isRelatedOrganization)
        }),
      )
      .subscribe(isRelate => {
        if (isRelate) {
          this.getTreeDat()
        }
      })
    this.loadData()
  }

  /**
   * 获取点击节点
   */
  getCurrentNode(ev: NzTreeNode) {
    this.organizationId = ev.origin.key
    this.loadData()
    console.log(ev)
    this.getGraphData({ organizationId: this.organizationId, organizationDimensionId: 'DEFAULT_DIMENSION' })
  }
  /** 获取树结构 */
  getTreeDat() {
    this.pmService.getOrganizationTree().subscribe(res => {
      if (+res.result.code === 0) {
        const { data }: { data: TreeSourceOpts } = res
        if (!data || !data.id) return
        this.nodeOpts = data
        this.setMaxLevel(this.getMaxLevel(data))
      }
    })
  }
  /**
   * 获取最大层级,利用的思想是树的广度遍历优先
   */
  getMaxLevel(data: TreeSourceOpts): number {
    const queue = []
    const node_list = []
    if (!Object.keys(data).length) return 0
    queue.push({ ...data, level: 1 })
    while (queue.length) {
      const node = queue.shift()
      node_list.push(node)
      const { subOrganizations: children } = node
      if (children && children.length) {
        queue.push(...children.map(item => ({ ...item, level: node.level + 1 }))) // queue.push.apply(queue,children.map(item => ({ ...item, level:node.level + 1 })))
      }
    }
    return Math.max(...node_list.map(item => item.level)) // Math.max.apply(null,node_list.map(item => item.level))
  }
  setMaxLevel(level: number) {
    const items = [...new Array(level)]
    const list_tmp = items.map((_, index) => ({
      value: index + 1,
      label: (index + 1).toString(),
    }))
    this.list = [{ value: -1, label: '展开全部' }, ...list_tmp]
  }

  ngAfterViewInit() {
    console.log(this.elementView)
    const height = (<HTMLDivElement>this.elementView!.nativeElement).offsetHeight
    this.tableClientHeight = height ? height - 100 : 500
  }
  loadData() {
    this.pageState = DataState.LOADING
    const params = {
      page: { size: this.pagesize, current: this.pageindex },
      name: this.query,
      queryOrganizationRootId: this.organizationId,
    }
    this.pmService.getPositionList(params).subscribe(resp => {
      const { data, page } = resp
      this.totalcount = (page && page.total) || 0
      this.listdata = data || []
      // 获取表头
      if (this.listdata.length) {
        this.pageState = DataState.EXIST_DATA
        setTimeout(() => {
          const warp = this.elementRef.nativeElement.querySelector('.ant-table-body')
          this.tableScroll = { y: this.tableClientHeight + 'px' }
          if (warp) {
            this.scrollbar = ScrollBarHelper.makeScrollbar(warp)
          }
        }, 1)
      } else {
        this.pageState = DataState.EMPTY
      }
      this.changeDel.detectChanges()
    })
  }
  /** 查询 */
  handleInputKeyup() {
    this.pageindex = 1
    this.loadData()
  }

  /**
   * 跳转页数
   */
  pageIndexChange(newPage: number) {
    this.pageindex = newPage
    this.loadData()
  }

  /**
   * 每页显示的条数
   */
  pageSizeChange($event: number) {
    this.pagesize = $event
    this.pageindex = 1
    this.loadData()
  }
  pageSizeEmployeeChange($event: number){
    this.employeePageSize = $event
    this.employPageIndex = 1
    this.queryEmployList()
  }
  pageIndexEmployeeChange(newPage: number){
    this.pageindex = newPage
    this.queryEmployList()
  }
  exportPosition() {
    const _params = {
      page: {
        size: this.pagesize,
        current: this.pageindex,
      },
    }
    this.pmService.exportAllPosition(_params).subscribe(resp => {
      downLoadFile(resp.body, resp.headers.get('content-disposition'))
    })
  }
  deletePosition(data: any) {
    this.selectedTableItem = data
    this.isDeleteVisible = true
  }
  enableOrNot(data: any) {
    this.isEnableVisible = true
    this.selectedTableItem = data
  }
  editOrAddPosition(data?: any) {
    data = { id: data && data.id, isRelated: this.isRelated }
    this.router.navigate(['../edit'], { relativeTo: this.route, queryParams: { data: JSON.stringify(data) } })
  }
  handleEnableOrDisableCancel() {
    this.isEnableVisible = false
  }
  handleEnableOrDisableOk() {
    this.isEnableVisible = false
    const params = {
      id: this.selectedTableItem.id,
      status: this.selectedTableItem.status === 'ENABLE' ? 'DISABLE' : 'ENABLE',
    }
    this.pmService.setPositionStatus(params).subscribe(resp => {
      if (+resp.result.code === 0) {
        // 启用/禁用成功后，则动态修改此条记录的状态，避免去调用列表接口
        this.listdata = this.listdata.map(item => ({
          ...item,
          status: item.id === params.id ? params.status : item.status,
        }))
      } else {
        this.msg.error(resp.result.message)
      }
    })
  }
  handleDeleteOk() {
    this.pmService.deletePosition({ id: this.selectedTableItem.id }).subscribe(resp => {
      if (+resp.result.code === 0) {
        this.handleInputKeyup()
      }
    })
  }
  queryEmployList(id?) {
    positionId = id || positionId
    this.isEmployeeListVisible = true
    const params = {
      page: { size: this.employeePageSize, current: this.employPageIndex },
      positionId,
    }
    this.pmService.getEmployeeList(params).subscribe(res => {
      const { data, page } = res
      this.employeeTotalCount = page.total
      this.employeeListData = data || []
      // 获取表头
      if (this.employeeListData.length) {
        setTimeout(() => {
          const warp = document.querySelector('employee-warp .ant-table-body')
          if (warp) {
            this.employeeScrollbar = ScrollBarHelper.makeScrollbar(warp)
          }
        }, 500)
      }
      this.changeDel.detectChanges()
    })
  }
  getGraphData(params?: {}) {
    this.pmService.getGraphDataByOrganInfo(params).subscribe(resp => {
      this.graphTabs = []
      const { result, data } = resp
      if (+result.code === 0) {
        this.graphSource = { ...data[0], zoom: 50 } || {} // 默认显示第一个职位架构图数据,
        this.positionId = this.graphSource.id
        this.hasGraphData = Object.keys(this.graphSource).length > 1
        _id_map_graph_data = data.reduce((prev, next) => {
          prev[next.id] = { ...next, zoom: 50 } // 每个数据源都有一个缩放比例字段，用于存储切换tab时，各个图表的缩放到了多少比例
          return prev
        }, {})
        while (data.length) {
          const item = data.shift()
          this.graphTabs.push({ name: item.name, id: item.id }) // 有几个tab页则意味着有几棵树，选择某某个tab,则显示tab对应的某棵树
        }
      }
    })
  }
  toggleTab(id: string) {
    this.positionId = id
    this.graphSource = _id_map_graph_data[id] || {}
  }
  handleZoom({ zoom, id }) {
    _id_map_graph_data[id].zoom = zoom
  }
  changeToggleUI(toggleName: string): void {
    if (toggleName === 'B') {
      if (this.graphSource) return
      this.getGraphData()
    }
  }
  ngOnDestroy(): void {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }
    if (this.employeeScrollbar) {
      this.employeeScrollbar.destroy()
      this.employeeScrollbar = null
    }
  }
}
