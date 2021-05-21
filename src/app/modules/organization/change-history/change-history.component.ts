import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd'
import PerfectScrollbar from 'perfect-scrollbar'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'
import { DataState, CHANGE_TYPE_MAP_CHINESE, ChangeResData, UserOpts } from '../interfaces/organization.model'
import { OrganizationService } from '../service/organization.service'
import * as moment from 'moment'
import { ActivatedRoute } from '@angular/router'
import { debounceTime, filter, map, switchMap } from 'rxjs/operators'
import { DelModalComponent } from '../modals/del-modal/del-modal.component'
import { ChangeDetailModalComponent } from '../modals/change-detail-modal/change-detail-modal.component'
import { BehaviorSubject, Subscription } from 'rxjs'

@Component({
  selector: 'app-change-history',
  templateUrl: './change-history.component.html',
  styleUrls: ['./change-history.component.less'],
})
export class ChangeHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  // router
  redirectUrl = '/organization/info'
  type: any[]
  options = {
    nzActive: true,
    nzHeader: '查询',
  }

  // 查询条件
  organizationId = ''
  changeType = ''
  createBy = ''
  dateRange: Date[] = []

  // modal
  confirmModal?: NzModalRef

  // table
  scrollbar: PerfectScrollbar
  tableScroll = { y: '500px' }
  tableClienHeight: number
  listdata: any[] = []
  pageState = DataState.LOADING
  totalcount = 0
  pagesize = 20
  pagecount = 1
  pageindex = 1
  query = ''

  // aysn select
  searchChange$ = new BehaviorSubject('')
  selectopts: UserOpts[] = []
  selectLoading = false

  subscrip: Subscription
  constructor(
    public elementRef: ElementRef,
    public changeDel: ChangeDetectorRef,
    public orgService: OrganizationService,
    private modal: NzModalService,
    private msg: NzMessageService,
    private router: ActivatedRoute,
  ) {}
  @ViewChild('tableWarp', { static: false }) elementView: ElementRef

  ngOnInit() {
    this.getTypeOpts()
      .pipe(
        filter(res => !!res.data),
        map(res => res.data),
        map(this.transSelectOpts),
      )
      .subscribe(res => {
        this.type = res
      })

    this.subscrip = this.router.params.subscribe(res => {
      this.organizationId = res.id
      this.loadData()
    })

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
    const height = (<HTMLDivElement>this.elementView!.nativeElement!).offsetHeight

    this.tableClienHeight = height ? height - 100 : 500
  }

  /** 下拉 */
  onSearch(value: string): void {
    this.selectLoading = true
    this.searchChange$.next(value)
  }

  /** 转换变更类型数据 */
  transSelectOpts(obj: any): any {
    const keys = Object.keys(obj)
    if (!keys.length) {
      return []
    }

    return keys.map(el => {
      return {
        value: el,
        label: obj[el],
      }
    })
  }

  /** 获取组织变更类型下拉 */
  getTypeOpts() {
    return this.orgService.organizationUpdateTypeList()
  }

  /**
   * 加载grid
   */
  loadData() {
    this.pageState = DataState.LOADING
    const [begin, end] = this.dateRange
    const beginDate = begin ? moment(begin).format('YYYY-MM-DD') : ''
    const endDate = end ? moment(end).format('YYYY-MM-DD') : ''

    const params = {
      organizationId: this.organizationId,
      startCreateDate: beginDate,
      endCreateDate: endDate,
      status: '',
      page: { size: this.pagesize, current: this.pageindex },
      changeType: this.changeType,
      createBy: this.createBy,
    }
    this.orgService.getNoteffectList(params).subscribe(res => {
      if (res.result!.code === 0) {
        const { data, page } = res
        this.pagecount = page.size

        this.totalcount = page.total
        this.listdata = data || []
        if (this.listdata.length) {
          this.pageState = DataState.EXIST_DATA
          setTimeout(() => {
            const warp = this.elementRef.nativeElement.querySelector('.ant-table-body')
            this.tableScroll = { y: this.tableClienHeight + 'px' }
            if (warp) {
              this.scrollbar = ScrollBarHelper.makeScrollbar(warp)
            }
          }, 1)
        } else {
          this.pageState = DataState.EMPTY
        }
        this.changeDel.detectChanges()
      } else {
        // this.pageState = DataState.EMPTY
      }
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
    setTimeout(() => {
      this.loadData()
    }, 0)

    this.elementRef.nativeElement.querySelector('.ant-table-body').scrollTop = 0
    setTimeout(() => {
      this.scrollbar.update()
    }, 300)
  }

  /**
   *  1 撤销
   *  2 删除
   */
  showConfirm(optType: number, id: string): void {
    const title = optType === 1 ? '撤销' : '删除'
    const req$ = optType === 1 ? this.orgService.cancelOrganization(id) : this.orgService.delHisOrganization(id)

    if (!id) {
      this.msg.error('缺少组织id')
      return
    }

    const modal = this.modal.create({
      nzContent: DelModalComponent,
      nzBodyStyle: { padding: '0px' },
      nzComponentParams: { title },
      nzClosable: false,
      nzWidth: 334,
      nzClassName: 'delete-box', // 对话框的类名,加上这个属性，则重写ant-modal-xxx类下的属性时，只会影响当前对话框
      nzFooter: [
        {
          label: '确定',
          type: 'primary',
          onClick: () =>
            new Promise(resolve => {
              req$.subscribe(res => {
                resolve(true)
                const { result } = res
                if (result.code === 0) {
                  modal.destroy()
                  this.msg.success(`${title}成功`)
                  setTimeout(() => {
                    this.loadData()
                  }, 0)
                } else {
                  const msg = result.message || `${title}失败`
                  this.msg.error(msg)
                }
              })
            }),
        },
        {
          label: '取消',
          type: 'primary',
          ghost: true,
          onClick: () => {
            modal.destroy()
          },
        },
      ],
    })

    this.confirmModal = modal
  }

  /** 详情 */
  showDetail(dat: ChangeResData, changeType: string): void {
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
      nzWidth: ['ORGANIZATION_DISABLE', 'ORGANIZATION_ENABLE'].includes(changeType)
        ? 460
        : ['ORGANIZATION_CHANGE', 'ORGANIZATION_MERGE'].includes(changeType)
        ? 1000
        : 800,
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

  ngOnDestroy() {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }

    if (this.subscrip) this.subscrip.unsubscribe()
    this.modal.closeAll()
  }

  exportChangeHistory() {
    this.msg.error('该后台接口还未开发')
  }
}
