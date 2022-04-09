import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd'
import { CHANGE_TYPE_MAP_CHINESE, ChangeResData, UserOpts } from '../interfaces/organization.model'
import { OrganizationService } from '../service/organization.service'
import * as moment from 'moment'
import { ActivatedRoute } from '@angular/router'
import { debounceTime, filter, map, switchMap } from 'rxjs/operators'
import { ChangeDetailModalComponent } from '../modals/change-detail-modal/change-detail-modal.component'
import { BehaviorSubject, Subscription } from 'rxjs'
import { DelModalComponent } from '@shared/components/del-modal/del-modal.component'
import { TableButton, TableHeader } from '@shared/components/vx-table/vx-table.component'

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
    nzActive: false,
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
  listdata: any[] = []
  listLoading: boolean = false
  pagination: any = {
    totaCount: 0,
    pageSize: 20,
    pageIndex: 1,
  }
  // 表头
  tableHeader: TableHeader[] = [
    {
      key: 'organizationName',
      name: '组织名称',
      width: 160,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'changeType',
      name: '变更类型',
      width: 100,
      type: '',
      format: (row, code) => {
        return code && row[code] ? CHANGE_TYPE_MAP_CHINESE[row[code]] : '-'
      },
      hide: false,
      action: false,
      sortField: '',
    },
    {
      key: 'createByName',
      name: '操作人',
      width: 100,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },

    {
      key: 'updateTime',
      name: '操作时间',
      width: 110,
      type: '',
      hide: false,
      format: (row, code) => {
        return code && row[code] ? moment(row[code]).format('YYYY-MM-DD HH:mm:ss') : '-'
      },
      action: false,
      sortField: '',
    },
    {
      key: 'effectiveDate',
      name: '生效时间',
      width: 110,
      type: '',
      hide: false,
      action: false,
      format: (row, code) => {
        return code && row[code] ? moment(row[code]).format('YYYY-MM-DD HH:mm:ss') : '-'
      },
      sortField: '',
    },

    {
      key: 'showStatus',
      name: '状态',
      width: 100,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
      slot: 'status',
    },
    {
      key: 'operation',
      name: '操作',
      width: 110,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
  ]

  /** 操作按钮 */
  tableRowBtns: TableButton = {
    delete: {
      show: row => row.status === 'UNDO_STATUS',
      order: 3,
    },
  }

  tbaleHeight = 0

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
      this.tbaleHeight = document.querySelector('.table-warp').clientHeight + 84
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

  ngAfterViewInit() {}

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
    const [begin, end] = this.dateRange
    const beginDate = begin ? moment(begin).format('YYYY-MM-DD') : ''
    const endDate = end ? moment(end).format('YYYY-MM-DD') : ''

    const params = {
      organizationId: this.organizationId,
      startCreateDate: beginDate,
      endCreateDate: endDate,
      status: '',
      page: { size: this.pagination.pageSize, current: this.pagination.pageIndex },
      changeType: this.changeType,
      createBy: this.createBy,
    }
    this.listLoading = true
    this.orgService.getNoteffectList(params).subscribe(res => {
      this.listLoading = false
      if (res.result!.code === 0) {
        const { data, page } = res
        this.listdata = data
        this.changeDel.detectChanges()
        this.pagination = {
          totaCount: page.total,
          pageSize: page.size,
          pageIndex: page.current,
        }
      }
    })
  }

  /** table heght */
  initTableUI(ev: boolean) {
    const height = document.querySelector('.table-warp').clientHeight
    this.tbaleHeight = ev ? height - 88 : height + 88
  }

  /** 查询 */
  handleInputKeyup() {
    this.pagination.pageIndex = 1
    this.loadData()
  }

  /**
   * 跳转页数
   */
  pageIndexChange(newPage: number) {
    this.pagination.pageIndex = newPage
    this.loadData()
  }

  /**
   * 每页显示的条数
   */
  pageSizeChange($event: number) {
    this.pagination.pageSize = $event
    this.pagination.pageIndex = 1
    setTimeout(() => {
      this.loadData()
    }, 0)

    this.elementRef.nativeElement.querySelector('.ant-table-body').scrollTop = 0
  }

  /** 操作按钮 */
  operatClick(ev: { btn: string; row: any }) {
    switch (ev.btn) {
      case 'delete':
        this.showConfirm(2, ev.row.organizationChangePlanId)
        break
    }
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
    if (this.subscrip) this.subscrip.unsubscribe()
    this.modal.closeAll()
  }

  exportChangeHistory() {
    this.msg.error('该后台接口还未开发')
  }
}
