import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import * as moment from 'moment'
import { NzMessageService, NzModalRef, NzModalService, NzTreeNode } from 'ng-zorro-antd'
import PerfectScrollbar from 'perfect-scrollbar'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'
import { DataState, ORG_TYPE, TreeSourceOpts } from '../interfaces/organization.model'
import { DelModalComponent } from '../modals/del-modal/del-modal.component'
import { EnableModalComponent } from '../modals/enable-modal/enable-modal.component'
import { GridDetaiModalComponent } from '../modals/grid-detai-modal/grid-detai-modal.component'
import { OrganizationService } from '../service/organization.service'
import { downLoadFile } from '../../../utils/utils'

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.less'],
})
export class InfoComponent implements OnInit, AfterViewInit, OnDestroy {
  levelCount = -1
  list: any[]
  tableClienHeight: number
  toggleUI = 'A'

  // tree
  nodeOpts: TreeSourceOpts
  treeloading = true

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

  // 流程图数据源
  graphSource: TreeSourceOpts

  // modal
  confirmModal?: NzModalRef

  // 下拉数据，暂时写这里
  org_type = ORG_TYPE

  constructor(
    public elementRef: ElementRef,
    public changeDel: ChangeDetectorRef,
    public orgService: OrganizationService,
    private modal: NzModalService,
    private msg: NzMessageService,
  ) {}

  @ViewChild('tableWarp', { static: false }) elementView: ElementRef

  ngOnInit() {
    this.getTreeDat()
  }

  /** 获取树结构 */
  getTreeDat() {
    this.orgService.getOrganizationTree().subscribe(res => {
      this.treeloading = false
      if (+res.result.code === 0) {
        const { data }: { data: TreeSourceOpts } = res
        if (!data || !data.id) return

        this.graphSource = data
        this.nodeOpts = data

        this.setMaxLevel(this.getMaxLevel(data))
      }
    })
  }

  /**
   * 获取点击节点
   */
  getCurrentNode(ev: NzTreeNode) {
    if (!ev.key) {
      return
    }
    this.loadData(ev.key)
  }

  /**
   * 获取最大层级
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
        queue.push(...children.map(item => ({ ...item, level: node.level + 1 })))
      }
    }
    return Math.max(...node_list.map(item => item.level))
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
    const height = (<HTMLDivElement>this.elementView!.nativeElement).offsetHeight

    this.tableClienHeight = height ? height - 100 : 500
    this.loadData()
  }

  /**
   * 加载grid
   */
  loadData(id?: string) {
    this.pageState = DataState.LOADING
    const params = {
      page: { size: this.pagesize, current: this.pageindex },
      name: this.query,
      queryOrganizationRootId: id || '',
    }
    this.orgService.getOrganizationList(params).subscribe(res => {
      this.changeDel.detectChanges()
      if (res.result!.code === 0) {
        const { data, page } = res
        this.pagecount = page.size

        this.totalcount = page.total
        this.listdata = data

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
      }
    })
  }
  /** 查询 */
  handleInputKeyup() {
    this.toggleUI = 'A'
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
      nzClassName: 'delete-box',
      nzFooter: [
        {
          label: '确定',
          type: 'primary',
          onClick: () =>
            new Promise(resolve => {
              this.orgService.delOrganization(id).subscribe(res => {
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

  /** 禁用modal */
  showEnablefirm(dat: any): void {
    const { id, status } = dat
    const title = status === 'DISABLE' ? '启用' : '禁用'

    const modal = this.modal.create({
      nzTitle: `${title}提示`,
      nzContent: EnableModalComponent,
      nzBodyStyle: { padding: '0 24px' },
      nzComponentParams: { title },
      nzClosable: false,
      nzWidth: 354,
      nzClassName: 'enable-disable-box',
      nzFooter: [
        {
          label: '确定',
          type: 'primary',
          onClick: (componentInstance: any) =>
            new Promise(resolve => {
              const date = componentInstance.date
              if (!date) {
                this.msg.warning('生效日期必选')
                resolve(true)
                return
              }

              const pdata = {
                effectiveDate: date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '',
                id,
                isInChangePlan: date ? true : false,
                status: status === 'ENABLE' ? 'DISABLE' : 'ENABLE',
              }
              this.orgService.updateOrganizationStatus(pdata).subscribe(res => {
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
  }

  /** 雇员，职位列表 */
  showListMoadl(listType: number, id: string): void {
    if (!id) {
      this.msg.warning('缺少组织id')
      return
    }

    const modal = this.modal.create({
      nzTitle: listType === 2 ? `雇员列表` : '职位列表',
      nzContent: GridDetaiModalComponent,
      nzBodyStyle: { padding: '10px 16px 0 24px', height: '400px' },
      nzComponentParams: { id, listType },
      nzClosable: false,
      nzWidth: 1000,
      nzClassName: 'grid-box',
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
    if (this.confirmModal) {
      this.confirmModal.destroy()
      this.confirmModal = null
    }
  }

  /** 导出 */
  exportOrganList() {
    const params = {
      page: { size: this.pagesize, current: this.pageindex },
    }
    this.orgService.exportOrganizationList(params).subscribe(resp => {
      // 获取文件名信息
      const headers = resp.headers
      console.log(headers.get('content-disposition'))
      downLoadFile(resp.body, headers.get('content-disposition'))
    })
  }
}
