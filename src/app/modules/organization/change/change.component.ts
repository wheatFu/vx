import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core'
import { OrganizationService } from '../service/organization.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import { downLoadFile } from '../../../utils/utils'
import * as moment from 'moment'
import { ChangeDetailModalComponent } from '../modals/change-detail-modal/change-detail-modal.component'
import { CHANGE_TYPE_MAP_CHINESE, ChangeResData, UserOpts } from '../interfaces/organization.model'
import { BehaviorSubject } from 'rxjs'
import { debounceTime, switchMap } from 'rxjs/operators'
import { TableHeader } from '@shared/components/vx-table/vx-table.component'
@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.less'],
})
export class ChangeComponent implements OnInit, AfterViewInit, OnDestroy {
  validateForm!: FormGroup
  options = {
    nzActive: false,
    nzHeader: '查询',
  }

  // aysn select
  searchChange$ = new BehaviorSubject('')
  selectopts: UserOpts[] = []
  selectLoading = false

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
      key: 'organizationCode',
      name: '组织编码',
      width: 120,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
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
      key: 'createBy',
      name: '操作人',
      width: 100,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },

    {
      key: 'createTime',
      name: '操作时间',
      width: 110,
      type: '',
      hide: false,
      format: (row, code) => {
        return code && row[code] ? moment(row[code]).format('YYYY-MM-DD HH:mm') : '-'
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
        return code && row[code] ? moment(row[code]).format('YYYY-MM-DD HH:mm') : '-'
      },
      sortField: '',
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

  tbaleHeight = 0
  query = ''
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
    this.loadData()
    this.tbaleHeight = document.querySelector('.table-warp').clientHeight + 84
  }

  ngAfterViewInit() {}

  /** 下拉 */
  onSearch(value: string): void {
    this.selectLoading = true
    this.searchChange$.next(value)
  }

  /**
   * 加载grid
   */
  loadData(extra?: any) {
    this.listLoading = true
    const params = {
      page: { size: this.pagination.pageSize, current: this.pagination.pageIndex },
      ...extra,
    }
    this.orgService.getOrganizationChangeList(params).subscribe(res => {
      this.listLoading = false
      if (res.result!.code === 0) {
        const { data, page } = res
        this.listdata = data
        this.pagination = {
          totaCount: page.total,
          pageSize: page.size,
          pageIndex: page.current,
        }
        this.changeDel.detectChanges()
      }
    })
  }
  getChangeTypes() {
    const { hasOwnProperty } = Object.prototype
    if (this.organizationUpdateTypes.length) return
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

  /** table heght */
  initTableUI(ev: boolean) {
    const height = document.querySelector('.table-warp').clientHeight
    this.tbaleHeight = ev ? height - 152 : height + 152
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
      page: { size: this.pagination.pageSize, current: this.pagination.pageIndex },
    }
    this.orgService.exportChangeList(params).subscribe(resp => {
      // 获取文件名信息
      const headers = resp.headers
      downLoadFile(resp.body, headers.get('content-disposition'))
    })
  }
  ngOnDestroy() {
    this.modal.closeAll()
  }
}
