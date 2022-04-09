import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { filter, map, tap } from 'rxjs/operators'
import { HrService } from '../../service/hr.service'

/**
 * @description
 * 此页面只有调动查看或者编辑才能进入
 */
@Component({
  selector: 'app-transfer-info',
  templateUrl: './transfer-info.component.html',
  styleUrls: ['./transfer-info.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferInfoComponent implements OnInit {
  // table
  pageState = 1
  listdata: any[] = []
  totalcount = 0
  pagesize = 20
  pagecount = 1
  pageindex = 1

  /**
   * 编辑员工id
   * 新增为''
   */
  editId: string

  /**
   * 只有查看和编辑才有
   * 区分在职与离职的查看和编辑
   * resign 离职 inser 在职
   */
  source: string
  redirectUrl: string

  constructor(
    private hrSrv: HrService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(
        filter(rt => !!(rt.type || (rt.type !== 'add' && rt.id))),
        tap(rt => {
          this.editId = rt['id'] || ''
          this.source = rt['source']
          this.redirectUrl = this.source === 'inser' ? '/hr/inservice' : '/hr/dismiss'
        }),
        map(rt => rt['id']),
      )
      .subscribe(id => {
        this.loadData(id)
      })
  }

  /**
   * 加载grid
   */
  loadData(id: string) {
    this.pageState = 1
    const params = {
      size: this.pagesize,
      current: this.pageindex,
      employeeId: id,
    }

    this.hrSrv.getEmpTransferList(params).subscribe(res => {
      if (res.result!.code === 0) {
        const { data, page } = res
        this.pagecount = page.size

        this.totalcount = page.total
        this.listdata = data

        this.pageState = 2

        this.cdr.detectChanges()
      }
    })
  }
  /** 查询 */
  handleInputKeyup() {
    this.pageindex = 1
    this.loadData(this.editId)
  }
  /**
   * 跳转页数
   */
  pageIndexChange(newPage: number) {
    this.pageindex = newPage
    this.loadData(this.editId)
  }

  /**
   * 每页显示的条数
   */
  pageSizeChange($event: number) {
    this.pagesize = $event
    this.pageindex = 1
    setTimeout(() => {
      this.loadData(this.editId)
    }, 0)
  }

  doCancel(ev) {
    // this.router.navigate([this.redirectUrl])
  }
}
