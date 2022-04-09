import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core'
import { fromEvent, merge, Subject } from 'rxjs'
import { takeUntil, debounceTime, map } from 'rxjs/operators'

interface Pagination {
  totaCount: number
  pageSize: number
  pageIndex: number
}

export interface TableHeader {
  key: string
  name: string
  width: number
  pin?: 'left' | 'right'
  type?: string
  hide?: boolean
  action?: boolean
  sortField?: string
  nzWidth?: string
  slot?: string
  format?: (row: any, code: string) => any
}

interface Button {
  show?: boolean | ((row: any) => boolean)
  disabled?: boolean | ((row: any) => boolean)
  order?: number
}

export interface TableButton {
  edit?: Button
  delete?: Button
  add?: Button
  enable?: Button
  disable?: Button
}

interface PinOpts {
  [prop: string]: number
}

enum Operation {
  edit = '编辑',
  delete = '删除',
}

@Component({
  selector: 'vx-table',
  templateUrl: './vx-table.component.html',
  styleUrls: ['./vx-table.component.less'],
})
export class VxTableComponent implements OnInit, OnChanges, OnDestroy {
  @HostBinding('class') get componentClass() {
    return 'vx-table'
  }
  /** 源数据 */
  @Input() listdata: any[]

  /**
   * 表头
   * pin left:左浮动,可设置多个,带有left的key不能重复
   * pin right: 有浮动，只能设置操作按钮，不设置有操作列则不浮动
   */
  @Input() tableHeader!: TableHeader[]

  /** td 内容超出 */
  @Input() ellipsis: boolean = true

  /** 显示分页 */
  @Input() showPagination: boolean = true

  /** parent height */
  @Input() ctxHight: number = 0

  /**
   * 单选或者多选
   * 对应output checkChange
   * 数据中带disabled 会影响 选择
   * 数据必须带有id主键
   * 数据带有selected: boolean 会自动选中
   */
  @Input() checkType: 'checkbox' | 'radio' = null

  /**
   * 操作列按钮展示方式
   * group 收缩按钮
   * abreast 并列展开
   */
  @Input() btnType: 'group' | 'abreast' = 'abreast'

  /** 自定义列模板 */
  @Input() columnSlot: {
    [prop: string]: TemplateRef<any>
  } = {}

  /** 操作列按钮 */
  @Input() tableRowBtns: TableButton = {}

  /** 分页 */
  @Input() pagination: Pagination = {
    totaCount: 0,
    pageSize: 20,
    pageIndex: 1,
  }

  /** 操作按钮 */
  @Output() operatClick = new EventEmitter<{ row: any; btn: keyof TableButton }>()

  // tslint:disable-next-line:no-output-native
  @Output() change = new EventEmitter<void>()

  /** 每页条数 */
  @Output() pageSizeChange = new EventEmitter<number>()

  /** 页change */
  @Output() pageIndexChange = new EventEmitter<number>()

  /**
   * 选择数据
   * checkbox number[]
   * radio number
   */
  @Output() checkChange = new EventEmitter<number | number[]>()

  private destory$ = new Subject<void>()

  tableWidth: number = 700
  tableHeight: number = 166
  operatWith: number = 80
  pinLeftWidth: PinOpts = {}

  /** 当前页数据 */
  listOfCurrentPageData: readonly any[] = []

  /** +++++++++++++++++++++++++ check start +++++++++++++++++++++++++++++++ */
  checked = false // checkbox all

  indeterminate = false // not all

  setOfCheckedId = new Set<number>()

  /** +++++++++++++++++++++++++ check end +++++++++++++++++++++++++++++++ */

  constructor(private el: ElementRef) {}

  ngOnInit() {
    merge(this.pageIndexChange, this.pageSizeChange)
      .pipe(takeUntil(this.destory$), debounceTime(0))
      .subscribe(() => this.change.emit())

    fromEvent(window, 'resize')
      .pipe(map(() => <number>this.el.nativeElement.offsetParent!.clientHeight || 0))
      .subscribe(res => {
        // const pgHeight = this.listdata.length && this.showPagination ? 47 : 0
        // this.tableHeight = res - 44 - pgHeight
      })
  }

  /** 获取table 初始width */
  get initWidth(): number {
    const rowNumWidth = 70
    const checkWith = ['checkbox', 'radio'].includes(this.checkType) ? 45 : 0
    return rowNumWidth + checkWith
  }

  ngOnChanges() {
    const headerList = this.tableHeader.filter(el => !el.hide && el.key !== 'rowNum')
    if (headerList.length) {
      this.initTableUI(headerList)
      this.initSelectedId()
    }
  }

  /** 初始化selected */
  initSelectedId(): void {
    const checkdIds = this.listdata.filter(el => el.selected).map(({ id }) => id)

    if (checkdIds.length && this.showCheckbox) {
      this.setOfCheckedId = new Set(checkdIds)
    }
  }

  /** 初始化table 宽高 pin */
  initTableUI(headerList: any[]): void {
    let width = this.initWidth
    headerList
      .filter(el => el.key !== 'operation')
      .forEach(el => {
        width += Number(el.width)
      })

    const optColum = headerList.filter(el => el.key === 'operation' && !el.hide)

    this.operatWith = this.btnType === 'group' ? (optColum.length ? 80 : 0) : optColum[0].width

    width = width + this.operatWith
    const tableHtml = document.getElementsByClassName('ant-table-wrapper')
    this.tableWidth = tableHtml.length && tableHtml[0].clientWidth && width > tableHtml[0].clientWidth ? width : null

    if (this.ctxHight) {
      // 页头 + 分页
      const pgHeight = this.listdata.length && this.showPagination ? 47 : 0
      this.tableHeight = this.ctxHight - 44 - pgHeight
    }

    // 计算pin
    this.calcPinLeft()
  }

  /** 计算pinleft的值 */
  calcPinLeft() {
    const pinLeft = this.tableHeader.filter(el => el.pin && el.pin === 'left' && !el.hide)

    const pinObj = {}
    if (pinLeft.length) {
      const withList = [this.initWidth, ...pinLeft.map(el => el.width)]
      const keyList = pinLeft.map(el => el.key)
      withList.pop()
      withList.reduce((a, b, i) => {
        pinObj[keyList[i]] = a + b
        return a + b
      }, 0)
    }
    this.pinLeftWidth = pinObj
  }

  /** pinLeft */
  getLeft(key: string): string {
    const left = this.pinLeftWidth[key] ? `${this.pinLeftWidth[key]}px` : null

    return left
  }

  /** ++++++++++++++++++++++++++++++++++++++++ operat start ++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  get btnKey(): string[] {
    if (!this.tableRowBtns) {
      return []
    }
    return Object.keys(this.tableRowBtns)
  }

  tranbtn(btn: string): string {
    return Operation[btn] || btn
  }
  /** 获取内置btn */
  showBtn(row: any, btn: string): boolean {
    if (!this.tableRowBtns[btn]) {
      return false
    }

    if (typeof this.tableRowBtns[btn].show === 'function') {
      return this.tableRowBtns[btn].show(row)
    }
    return this.tableRowBtns[btn].show
  }

  /** 获取按钮顺序btn */
  getOrder(btn: string): number {
    return this.tableRowBtns[btn] && this.tableRowBtns[btn].order ? this.tableRowBtns[btn].order : 0
  }

  /** 操作列click */
  handleBtnClick(row: any, btn: keyof TableButton) {
    if (btn) {
      this.operatClick.emit({ row, btn })
    }
  }

  /** ++++++++++++++++++++++++++++++++++++++++ operat start ++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  onCurrentPageDataChange(ev: any[]) {
    this.listOfCurrentPageData = ev
    this.refreshCheckedStatus()
  }

  /** ++++++++++++++++++++++++++++++++++++++++ checkbox start ++++++++++++++++++++++++++++++++++++++++++++++++++++ */
  get showCheckbox(): boolean {
    return this.checkType === 'checkbox'
  }

  /** 全选状态  */
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ disabled }) => !disabled)
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id))
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked
  }

  /** 更新选择状态  */
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id)
    } else {
      this.setOfCheckedId.delete(id)
    }
    this.checkChange.emit([...this.setOfCheckedId])
  }

  /** 全选 */
  allChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .filter(({ disabled }) => !disabled)
      .forEach(({ id }) => this.updateCheckedSet(id, checked))
    this.refreshCheckedStatus()
  }

  /** 单选 */
  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked)
    this.refreshCheckedStatus()
  }
  /** ++++++++++++++++++++++++++++++++++++++++ checkbox end ++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  /** ++++++++++++++++++++++++++++++++++++++++ radio start ++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  get showRadio(): boolean {
    return this.checkType === 'radio'
  }

  onItemSelected(id: number) {
    this.listdata.forEach(item => {
      item['selected'] = item.id === id
    })
    this.checkChange.emit(id)
  }
  /** ++++++++++++++++++++++++++++++++++++++++ radio end ++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

  ngOnDestroy() {
    this.destory$.next()
    this.destory$.complete()

    this.setOfCheckedId.clear()
  }
}
