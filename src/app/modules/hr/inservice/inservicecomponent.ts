import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { HrService } from '../service/hr.service'
import { Router, ActivatedRoute } from '@angular/router'
import PerfectScrollbar from 'perfect-scrollbar'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'
import { NzMessageService } from 'ng-zorro-antd'
import { DataState, GENDER_MAP_CHINESE } from '../interfaces/hr.model'
@Component({
  selector: 'app-inservice',
  templateUrl: './inservice.component.html',
  styleUrls: ['./inservice.component.less'],
})
export class InServiceComponent implements OnInit, AfterViewInit, OnDestroy {
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
    private router: Router,
    private route: ActivatedRoute,
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
    this.hrService.getInServiceList(params).subscribe(resp => {
      const { data, page } = resp
      this.totalcount = (page && page.total) || 0
      this.tableData = data.map(item => ({ ...item, gender: GENDER_MAP_CHINESE[item.gender] })) || []
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
  exportInService() {
    const _params = {
      size: this.pagesize,
      current: this.pageindex,
    }
    this.hrService.exportListTemplate(_params).subscribe(resp => {
      const { result, data } = resp
      if (+result.code === 0) {
      }
    })
  }
  ngOnDestroy(): void {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }
  }
}
