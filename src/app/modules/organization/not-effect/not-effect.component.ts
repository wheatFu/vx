import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { NzMessageService, NzModalRef, NzModalService } from 'ng-zorro-antd'
import PerfectScrollbar from 'perfect-scrollbar'
import { mergeMap } from 'rxjs/operators'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'
import { DataState, ORG_TYPE } from '../interfaces/organization.model'
import { DelModalComponent } from '../modals/del-modal/del-modal.component'
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

  // 下拉数据，暂时写这里
  org_type = ORG_TYPE
  constructor(
    public elementRef: ElementRef,
    public changeDel: ChangeDetectorRef,
    public orgService: OrganizationService,
    private modal: NzModalService,
    private msg: NzMessageService,
  ) {}

  @ViewChild('tableWarp', { static: true }) elementView: ElementRef

  ngOnInit() {
    const height = (<HTMLDivElement>this.elementView.nativeElement).offsetHeight

    this.tableClienHeight = height ? height - 100 : 500
    this.loadData()
  }

  /**
   * 加载grid
   */
  loadData() {
    this.pageState = DataState.LOADING
    const params = {
      status: 'DOING_STATUS',
      changeType: 'ORGANIZATION_NEW',
      page: { size: this.pagesize, current: this.pageindex },
      organizationName: this.query,
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
            if (warp) {
              this.scrollbar = ScrollBarHelper.makeScrollbar(warp)
              this.tableScroll = {
                y: this.tableClienHeight + 'px',
              }
            }
          }, 1)
        } else {
          this.pageState = DataState.EMPTY
        }
        this.changeDel.detectChanges()
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
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }

    if (this.confirmModal) {
      this.confirmModal.destroy()
      this.confirmModal = null
    }
  }
}
