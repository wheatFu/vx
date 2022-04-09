import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { DelModalComponent } from '@shared/components/del-modal/del-modal.component'
import { TableButton, TableHeader } from '@shared/components/vx-table/vx-table.component'
import * as moment from 'moment'
import { NzMessageService, NzModalRef, NzModalService } from 'ng-zorro-antd'
import { mergeMap } from 'rxjs/operators'
import { ORG_TYPE } from '../interfaces/organization.model'
import { OrganizationService } from '../service/organization.service'

@Component({
  selector: 'app-not-effect',
  templateUrl: './not-effect.component.html',
  styleUrls: ['./not-effect.component.less'],
})
export class NotEffectComponent implements OnInit, OnDestroy {
  // router
  redirectUrl = '/organization/info'

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
      key: 'type',
      name: '组织类型',
      width: 100,
      type: '',
      format: (row, code) => {
        return code && row[code] ? ORG_TYPE[row[code]] : '-'
      },
      hide: false,
      action: false,
      sortField: '',
    },
    {
      key: 'region',
      name: '所属区域',
      width: 100,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'status',
      name: '组织状态',
      width: 100,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
      slot: 'status',
    },

    {
      key: 'effectiveDate',
      name: '生效日期',
      width: 100,
      type: '',
      hide: false,
      action: false,
      format: (row, code) => {
        return code && row[code] ? moment(row[code]).format('YYYY-MM-DD') : '-'
      },
      sortField: '',
    },
    {
      key: 'createByName',
      name: '操作人',
      width: 80,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },

    {
      key: 'operation',
      name: '操作',
      width: 80,
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
      show: true,
      order: 1,
    },
  }
  query = ''

  constructor(
    public elementRef: ElementRef,
    public changeDel: ChangeDetectorRef,
    public orgService: OrganizationService,
    private modal: NzModalService,
    private msg: NzMessageService,
  ) {}

  @ViewChild('tableWarp', { static: true }) elementView: ElementRef

  ngOnInit() {
    this.loadData()
  }

  get getTbaleHeight() {
    return document.querySelector('.table-warp').clientHeight
  }
  /**
   * 加载grid
   */
  loadData() {
    this.listLoading = true
    const params = {
      status: 'DOING_STATUS',
      changeType: 'ORGANIZATION_NEW',
      page: { size: this.pagination.pageSize, current: this.pagination.pageIndex },
      organizationName: this.query,
    }
    this.orgService.getNoteffectList(params).subscribe(res => {
      if (res.result!.code === 0) {
        const { data, page } = res
        if (data.length) {
          this.listdata = data.map((el: { [x: string]: any }) => {
            const item = el['changeContent'] || {}
            return { ...el, region: item['region'], type: item['type'] }
          })
        } else {
          this.listdata = []
        }

        this.pagination = {
          totaCount: page.total,
          pageSize: page.size,
          pageIndex: page.current,
        }
        this.listLoading = false
        this.changeDel.detectChanges()
      }
    })
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

  /** 操作 */
  operatClick(ev: { btn: string; row: any }) {
    switch (ev.btn) {
      case 'delete':
        this.showConfirm(ev.row.organizationChangePlanId)
        break
    }
  }
  /** 删除modal */
  showConfirm(id: string): void {
    if (!id) {
      this.msg.error('缺少组织id')
      return
    }
    const modal = this.modal.create({
      nzContent: DelModalComponent,
      nzBodyStyle: { padding: '0px' },
      nzComponentParams: { title: '删除' },
      nzClosable: false,
      nzWidth: 334,
      nzFooter: [
        {
          label: '确定',
          type: 'primary',
          onClick: () =>
            new Promise(resolve => {
              this.orgService
                .cancelOrganization(id)
                .pipe(mergeMap(() => this.orgService.delHisOrganization(id)))
                .subscribe(res => {
                  resolve(true)
                  const { result } = res
                  if (result.code === 0) {
                    modal.destroy()
                    this.msg.success('操作成功')
                    setTimeout(() => {
                      this.loadData()
                    }, 0)
                  } else {
                    const msg = result.message || '操作失败'
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

  ngOnDestroy() {
    if (this.confirmModal) {
      this.confirmModal.destroy()
      this.confirmModal = null
    }
  }
}
