import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core'
import PerfectScrollbar from 'perfect-scrollbar'
import { HrService } from '../service/hr.service'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import * as moment from 'moment'
import { ScrollBarHelper } from '../../../utils/scrollbar-helper'
import { DetailComponent } from '../components/modals/detail.component'
import { ChangeResData, DataState } from '../interfaces/hr.model'
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.less'],
})
export class HistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  options = {
    nzActive: true,
    nzHeader: '查询',
  }
  // table
  scrollbar: PerfectScrollbar
  tableScroll = { y: '500px' }
  listdata: any[] = []
  pageState = DataState.LOADING
  totalcount = 0
  pagesize = 20
  pagecount = 1
  pageindex = 1
  tableClientHeight: number
  changeTypes: Array<{ label: string; value: string }> = []
  changeType: string
  createBy: string
  dateRange: Date[] = []
  name: string
  constructor(
    private elementRef: ElementRef,
    private changeDel: ChangeDetectorRef,
    private hrService: HrService,
    private msg: NzMessageService,
    private modal: NzModalService,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.tableClientHeight = this.elementRef.nativeElement.querySelector('.table-warp').clientHeight - 100
    this.loadData()
  }
  loadData(condition?) {
    this.pageState = DataState.LOADING
    const params = {
      size: this.pagesize,
      current: this.pageindex,
      ...condition,
    }
    this.hrService.getChangeHistoryList(params).subscribe(res => {
      if (res.result!.code === 0) {
        const { data, page } = res
        this.pagecount = page!.size
        this.totalcount = page!.total
        this.listdata = data
        if (this.listdata.length) {
          this.pageState = DataState.EXIST_DATA
          setTimeout(() => {
            this.scrollbar = ScrollBarHelper.makeScrollbar(
              this.elementRef.nativeElement.querySelector('.ant-table-body'),
            )

            this.tableScroll = {
              y: this.tableClientHeight + 'px',
            }
          }, 1)
        } else {
          this.pageState = DataState.EMPTY
        }
        this.changeDel.detectChanges()
      }
    })
  }
  getChangeTypes() {
    if (this.changeTypes.length) return
    this.hrService.getChangeTypeList().subscribe(resp => {
      const { result, data } = resp
      if (result.code === 0) {
        this.changeTypes = Object.keys(data).reduce((prev, key) => {
          prev = [...prev, { label: data[key], value: key }]
          return prev
        }, [])
      } else {
        this.msg.warning(result.message)
      }
    })
  }

  /** 详情 */
  getDetailInfo(data: ChangeResData, changeType: string) {
    if (!data) {
      this.msg.warning('详情为空')
      return
    }
    if (!changeType) {
      this.msg.warning('缺少变更类型')
      return
    }
    const modal = this.modal.create({
      nzTitle: '查看详情',
      nzContent: DetailComponent,
      nzComponentParams: { data, changeType },
      nzBodyStyle: { padding: '10px 24px' },
      nzClosable: false,
      nzMaskClosable: false,
      nzWidth: ['TRANSFER', 'RESIGN', 'REGULAR'].includes(changeType) ? 750 : 1000,
      nzClassName: 'detail-box',
      nzFooter: [
        {
          label: '关闭',
          type: 'primary',
          ghost: true,
          onClick: () => {
            modal.destroy()
          },
        },
      ],
    })
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
    setTimeout(() => {
      this.loadData()
    }, 0)

    this.elementRef.nativeElement.querySelector('.ant-table-body').scrollTop = 0
    setTimeout(() => {
      this.scrollbar.update()
    }, 300)
  }

  /** table height */
  initTableUI(ev: boolean) {
    const height = ev ? this.tableClientHeight : this.tableClientHeight + 150

    setTimeout(() => {
      this.tableScroll = { y: height + 'px' }
      this.scrollbar.update()
    }, 100)
  }
  queryList() {
    const { changeType, name, createBy, dateRange } = this
    const [startTime, endTime] = dateRange
    const condition = {
      changeType,
      name,
      createBy,
      startTime: startTime ? moment(startTime).format('YYYY-MM-DD') : '',
      endTime: endTime ? moment(endTime).format('YYYY-MM-DD') : '',
    }
    this.loadData(condition)
  }
  exportChangeList() {}
  ngOnDestroy() {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }
    this.modal.closeAll()
  }
}
