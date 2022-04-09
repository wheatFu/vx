import { Component, OnDestroy, OnInit } from '@angular/core'
import { DelModalComponent } from '@shared/components/del-modal/del-modal.component'
import { TableButton, TableHeader } from '@shared/components/vx-table/vx-table.component'
import * as moment from 'moment'
import { NzModalRef, NzModalService, NzMessageService } from 'ng-zorro-antd'
import { delay } from 'rxjs/operators'
import { GENDER_MAP_CHINESE } from '../../hr/interfaces/hr.model'
import { HolidayService } from '../service/holiday.service'

@Component({
  selector: 'app-quota',
  templateUrl: './quota.component.html',
  styleUrls: ['./quota.component.less'],
})
export class QuotaComponent implements OnInit, OnDestroy {
  // table
  listdata: any[] = []
  listLoading: boolean = false

  query = ''

  GENDER = GENDER_MAP_CHINESE

  /** 分页 */
  pagination: any = {
    totaCount: 0,
    pageSize: 20,
    pageIndex: 1,
  }

  /**
   * 表头
   * pin left:左浮动,可设置多个,带有left的key不能重复
   * pin right: 有浮动，只能设置操作按钮，不设置有操作列则不浮动
   */
  tableHeader: TableHeader[] = [
    {
      key: 'code',
      name: '工号',
      width: 100,
      pin: 'left',
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'name',
      name: '姓名',
      width: 100,
      pin: 'left',
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'organizationName',
      name: '部门',
      width: 130,
      pin: 'left',
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'positionName',
      name: '职位',
      width: 110,
      pin: 'left',
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },

    {
      key: 'gender',
      name: '休假项目（单位）',
      width: 145,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '额度归属',
      width: 110,
      type: '',
      hide: false,
      format: (row, code) => {
        return code && row[code] ? GENDER_MAP_CHINESE[row[code]] : '-'
      },
      action: false,
      sortField: '',
    },
    {
      key: 'startTime',
      name: '额度开始日期',
      width: 110,
      pin: 'left',
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'endTime',
      name: '额度结束日期',
      width: 120,
      type: '',
      hide: false,
      format: (row, code) => {
        return code && row[code] ? moment(row[code]).format('YYYY-MM-DD') : '-'
      },
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '总额度',
      width: 110,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '已使用',
      width: 110,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '申请中',
      width: 110,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '当前剩余数',
      width: 110,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '使用截止日期',
      width: 130,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '过期数',
      width: 110,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'status',
      name: '状态',
      width: 110,
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
      width: 140,
      type: '',
      pin: 'right',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
  ]

  /** 操作按钮 */
  tableRowBtns: TableButton = {
    delete: {
      show: row => row.code !== 'knx2002',
      order: 1,
    },
    edit: { show: true, order: 3 },
  }

  // tableBtnType = 'group'
  // modal
  confirmModal?: NzModalRef

  constructor(private modal: NzModalService, private msg: NzMessageService, private hlidaySrv: HolidayService) {}

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
      size: this.pagination.pageSize,
      current: this.pagination.pageIndex,
      keyword: this.query,
    }
    this.hlidaySrv
      .getEmployeeList(params)
      .pipe(delay(500))
      .subscribe(res => {
        if (res.result!.code === 0) {
          const { data, page } = res
          this.listdata = data

          this.pagination = {
            totaCount: page.total,
            pageSize: page.size,
            pageIndex: page.current,
          }
          this.listLoading = false
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
  }

  /** 操作列点击事件 */
  operatClick(ev: { row: any; btn: keyof TableButton }) {
    console.log(ev)
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
              this.hlidaySrv.getOrganizationTree().subscribe(res => {
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

  checkChange(ev) {
    console.log(ev)
  }
  myalert() {
    console.log(11)
  }

  ngOnDestroy() {
    if (this.confirmModal) {
      this.confirmModal.destroy()
      this.confirmModal = null
    }
  }
}
