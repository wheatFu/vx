import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core'
import { NzMessageService, NzModalRef, NzModalService } from 'ng-zorro-antd'
import { HolidayService } from '../../service/holiday.service'
import { TableButton, TableHeader } from '@shared/components/vx-table/vx-table.component'
import { delay } from 'rxjs/operators'
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.less'],
})
export class ListComponent implements OnInit, OnDestroy {
  // table
  listdata: any[] = []
  listLoading: boolean = false
  query = ''
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
      name: '项目编号',
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
      name: '休假项目名称',
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
      name: '单位',
      width: 130,
      pin: 'left',
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
    },
    {
      key: 'gender',
      name: '额度类型',
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
      name: '当前状态',
      width: 145,
      type: '',
      hide: false,
      format: null,
      action: false,
      sortField: '',
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
      show: true,
      order: 3,
    },
    edit: { show: true, order: 1 },
  }

  // modal
  confirmModal?: NzModalRef

  constructor(private modal: NzModalService, private msg: NzMessageService, private holidaySrv: HolidayService) {}

  ngOnInit() {
    this.loadData()
  }

  get getTableHeight() {
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
    this.holidaySrv
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
    this.loadData()
  }

  /** 操作列点击事件 */
  operatClick(ev: { row: any; btn: keyof TableButton }) {
    console.log(ev)
  }
  ngOnDestroy() {
    if (this.confirmModal) {
      this.confirmModal.destroy()
      this.confirmModal = null
    }
  }
  enableOrDisable(row) {
    alert(JSON.stringify(row))
  }
}
