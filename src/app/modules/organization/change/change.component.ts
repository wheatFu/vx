import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core'
import PerfectScrollbar from 'perfect-scrollbar'
import { OrganizationService } from '../service/organization.service'
import { ScrollBarHelper } from '../../../utils/scrollbar-helper'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import { downLoadFile } from '../../../utils/utils'
import * as moment from 'moment'
import { ChangeDetailModalComponent } from '../modals/change-detail-modal/change-detail-modal.component'
import { DataState, CHANGE_TYPE_MAP_CHINESE, ChangeResData, UserOpts } from '../interfaces/organization.model'
import { BehaviorSubject } from 'rxjs'
import { debounceTime, switchMap } from 'rxjs/operators'
@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.less'],
})
export class ChangeComponent implements OnInit, AfterViewInit, OnDestroy {
  validateForm!: FormGroup
  options = {
    nzActive: true,
    nzHeader: '查询',
  }

  // aysn select
  searchChange$ = new BehaviorSubject('')
  selectopts: UserOpts[] = []
  selectLoading = false

  // table
  scrollbar: PerfectScrollbar
  tableScroll = { y: '500px' }
  listdata: any[] = []
  pageState = DataState.LOADING
  totalcount = 0
  pagesize = 20
  pagecount = 1
  pageindex = 1
  query = ''
  tableClienHeight: number
  organizationUpdateTypes: Array<{ label: string; value: string }> = []

  constructor(
    private elementRef: ElementRef,
    private changeDel: ChangeDetectorRef,
    private orgService: OrganizationService,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private modal: NzModalService,
  ) {
    this.validateForm = this.fb.group({
      organizationName: [null],
      changeType: [null],
      date: [null],
      createBy: [null],
    })
  }

  ngOnInit() {
    this.searchChange$
      .pipe(
        debounceTime(500),
        switchMap(name => this.orgService.getUser(name)),
      )
      .subscribe(res => {
        this.selectopts = res
        this.selectLoading = false
      })
  }

  ngAfterViewInit() {
    this.tableClienHeight = this.elementRef.nativeElement.querySelector('.table-warp').clientHeight - 100
    this.loadData()
  }

  /** 下拉 */
  onSearch(value: string): void {
    this.selectLoading = true
    this.searchChange$.next(value)
  }

  /**
   * 加载grid
   */
  loadData(extra?) {
    this.pageState = DataState.LOADING
    const params = {
      page: { size: this.pagesize, current: this.pageindex },
      ...extra,
    }
    this.orgService.getOrganizationChangeList(params).subscribe(res => {
      if (res.result!.code === 0) {
        const { data, page } = res
        this.pagecount = page!.size
        this.totalcount = page!.total
        this.listdata =
          data.map(item => {
            const { createTime, effectiveDate } = item
            return {
              ...item,
              createTime: moment(createTime).format('YYYY/MM/DD HH:mm'),
              effectiveDate: moment(effectiveDate).format('YYYY/MM/DD HH:mm'),
            }
          }) || []
        if (this.listdata.length) {
          this.pageState = DataState.EXIST_DATA
          setTimeout(() => {
            this.scrollbar = ScrollBarHelper.makeScrollbar(
              this.elementRef.nativeElement.querySelector('.ant-table-body'),
            )

            this.tableScroll = {
              y: this.tableClienHeight + 'px',
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
    const { hasOwnProperty } = Object.prototype
    if (this.organizationUpdateTypes.length) return this.organizationUpdateTypes
    this.orgService.organizationUpdateTypeList().subscribe(resp => {
      const { data } = resp
      for (const key in data) {
        if (hasOwnProperty.call(data, key)) {
          this.organizationUpdateTypes.push({ label: data[key], value: key })
        }
      }
    })
  }

  /** 详情 */
  getDetailInfo(dat: ChangeResData, changeType: string) {
    const title = CHANGE_TYPE_MAP_CHINESE[changeType]
    if (!dat) {
      this.msg.warning('详情为空')
      return
    }
    if (!changeType) {
      this.msg.warning('缺少变更类型')
      return
    }
    const modal = this.modal.create({
      nzTitle: title,
      nzContent: ChangeDetailModalComponent,
      nzComponentParams: { dat, changeType },
      nzBodyStyle: { padding: '10px 24px' },
      nzClosable: false,
      nzMaskClosable: false,
      nzWidth: ['ORGANIZATION_DISABLE', 'ORGANIZATION_ENABLE'].includes(changeType)
        ? 460
        : ['ORGANIZATION_CHANGE', 'ORGANIZATION_MERGE'].includes(changeType)
        ? 1000
        : 800,
      nzWrapClassName: 'change-detail-box',
      nzClassName: 'change-detail-box',
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

  /** table heght */
  initTableUI(ev: boolean) {
    const height = ev ? this.tableClienHeight : this.tableClienHeight + 150

    setTimeout(() => {
      this.tableScroll = { y: height + 'px' }
      this.scrollbar.update()
    }, 100)
  }
  queryUpdateHistory() {
    const { validateForm } = this
    const val = validateForm.getRawValue()
    let _params = {
      ...val,
    }
    if (val.date) {
      let [startCreateDate, endCreateDate] = val.date
      startCreateDate = startCreateDate ? moment(startCreateDate).format('YYYY-MM-DD') : ''
      endCreateDate = endCreateDate ? moment(endCreateDate).format('YYYY-MM-DD') : ''
      _params = { ..._params, startCreateDate, endCreateDate }
    }
    delete _params.date
    this.loadData(_params)
  }
  exportChangeList() {
    const params = {
      page: { size: this.pagesize, current: this.pageindex },
    }
    this.orgService.exportChangeList(params).subscribe(resp => {
      // 获取文件名信息
      const headers = resp.headers
      downLoadFile(resp.body, headers.get('content-disposition'))
    })
  }
  ngOnDestroy() {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }
    this.modal.closeAll()
  }
}
