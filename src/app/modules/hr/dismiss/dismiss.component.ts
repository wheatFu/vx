import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import PerfectScrollbar from 'perfect-scrollbar'
import { HrService } from '../service/hr.service'
import { NzMessageService } from 'ng-zorro-antd'
import { ScrollBarHelper } from '../../../utils/scrollbar-helper'
import { DataState, GENDER_MAP_CHINESE } from '../interfaces/hr.model'
@Component({
  templateUrl: './dismiss.component.html',
  styleUrls: ['./dismiss.component.less'],
})
export class DismissComponent implements OnInit, OnDestroy, AfterViewInit {
  scrollbar: PerfectScrollbar
  tableScroll = { y: '500px' }
  tableClientHeight: number
  tableData: any[] = []
  pageState = DataState.LOADING
  totalcount = 0
  pagesize = 20
  pageindex = 1
  query = ''
  organizationId = ''
  constructor(
    private elementRef: ElementRef,
    private changeDel: ChangeDetectorRef,
    private hrService: HrService,
    private msg: NzMessageService,
  ) {}
  @ViewChild('tableWarp', { static: false }) elementView: ElementRef
  ngOnInit() {}

  ngAfterViewInit() {
    const height = (<HTMLDivElement>this.elementView!.nativeElement).offsetHeight
    this.tableClientHeight = height ? height - 100 : 500
    this.getTableData()
  }
  getTableData() {
    this.pageState = DataState.LOADING
    const params = {
      size: this.pagesize,
      current: this.pageindex,
      name: this.query,
    }
    this.hrService.getResignList(params).subscribe(resp => {
      const { data, page } = resp
      this.totalcount = (page && page.total) || 0
      this.tableData =
        data.map(item => {
          const { gender } = item
          return {
            ...item,
            gender: GENDER_MAP_CHINESE[gender],
          }
        }) || []
      // 获取表头
      if (this.tableData.length) {
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
    this.getTableData()
  }

  /**
   * 跳转页数
   */
  pageIndexChange(newPage: number) {
    this.pageindex = newPage
    this.getTableData()
  }

  /**
   * 每页显示的条数
   */
  pageSizeChange($event: number) {
    this.pagesize = $event
    this.pageindex = 1
    this.getTableData()
  }
  exportPosition() {
    const _params = {
      size: this.pagesize,
      current: this.pageindex,
    }
    this.hrService.exportResignedTemplate(_params).subscribe(resp => {
      const { result } = resp
      if (+result.code === 0) {
      }
    })
  }
  private bfs(data): Array<any> {
    const nodelist = []
    const queue = []
    if (data != null) {
      queue.unshift(data)
      while (queue.length) {
        const node = queue.shift()
        nodelist.push(node)
        const { children } = node
        if (children) {
          queue.push.apply(queue, children)
        }
      }
    }
    return nodelist
  }
  private dfs(data): Array<any> {
    const nodelist = []
    const queue = []
    if (data != null) {
      queue.unshift(data)
      while (queue.length) {
        const node = queue.shift()
        nodelist.push(node)
        const { children } = node
        if (children) {
          queue.unshift.apply(queue, children)
        }
      }
    }
    return nodelist
  }
  private bfsRecursion(data, nodelist = []): Array<any> {
    const newData = [] // 存储节点的数据源
    if (data != null) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.length; i++) {
        nodelist.push.call(nodelist, data[i])
        // tslint:disable-next-line:no-unused-expression
        data[i].children && newData.push.apply(newData, data[i].children)
        // tslint:disable-next-line:no-unused-expression
        data.length === i + 1 && this.bfsRecursion(newData, nodelist)
      }
    }
    return nodelist
  }
  private dfsRecursion(data, nodelist = []): Array<any> {
    if (data != null) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.length; i++) {
        nodelist.push.call(nodelist, data[i])
        const { children } = data[i]
        if (children) {
          this.dfsRecursion(children, nodelist)
        }
      }
    }
    return nodelist
  }
  ngOnDestroy(): void {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }
  }
}
