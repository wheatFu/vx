import { Component, OnDestroy, OnInit } from '@angular/core'
import { DelModalComponent } from '@shared/components/del-modal/del-modal.component'
import { NzMessageService, NzModalRef, NzModalService } from 'ng-zorro-antd'
import { HrEditService } from '../hr-edit/hr-edit.service'
import { GENDER_MAP_CHINESE } from '../interfaces/hr.model'
import { HrService } from '../service/hr.service'

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.less'],
})
export class EntryComponent implements OnInit, OnDestroy {
  // table
  pageState = 1
  listdata: any[] = []
  totalcount = 0
  pagesize = 20
  pagecount = 1
  pageindex = 1
  query = ''

  GENDER = GENDER_MAP_CHINESE

  // modal
  confirmModal?: NzModalRef

  constructor(
    private hrSrv: HrService,
    private modal: NzModalService,
    private msg: NzMessageService,
    private hrEidtSrv: HrEditService,
  ) {}

  ngOnInit() {
    this.loadData()

    /** 清空一次共享数据 */
    this.hrEidtSrv.clearEmpBase()
  }

  /**
   * 加载grid
   */
  loadData() {
    this.pageState = 1
    const params = {
      size: this.pagesize,
      current: this.pageindex,
      keyword: this.query,
    }
    this.hrSrv.getEmployeeList(params).subscribe(res => {
      if (res.result!.code === 0) {
        const { data, page } = res
        this.pagecount = page.size

        this.totalcount = page.total
        this.listdata = data

        this.pageState = this.listdata.length ? 3 : 2
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
  }

  /** 删除modal */
  showConfirm(id: string): void {
    if (!id) {
      this.msg.error('缺少员工id')
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
              this.hrSrv.delEmployee(id).subscribe(res => {
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
