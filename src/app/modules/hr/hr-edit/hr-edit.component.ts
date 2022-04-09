import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router, ActivationEnd, ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'
import { filter, mergeMap, tap } from 'rxjs/operators'
import { EmpTabs } from '../interfaces/hr.model'
import { HrEditService } from './hr-edit.service'

@Component({
  selector: 'app-hr-edit',
  templateUrl: './hr-edit.component.html',
  styleUrls: ['./hr-edit.component.less'],
})
export class HrEditComponent implements OnInit, OnDestroy {
  private scp$!: Subscription
  tabs: Array<EmpTabs> = []

  pos = 0
  redirect = '/hr/entry'
  personDat: any

  urlKey: string
  /**
   * 路由参数 操作类型
   *  add 新增，entry 办理入职，edit编辑，look 查看
   */
  operat: string
  editId: string

  /**
   * 只有查看和编辑才有
   * 区分在职与离职的查看和编辑
   * resign 离职 inser 在职
   */
  source: string

  retnTitle: string
  prantTitle = { add: '入职管理', entry: '入职管理', resign: '离职员工管理', inser: '在职员工管理' }
  title = { add: '新建员工', entry: '办理入职', edit: '编辑', look: '查看' }

  tabsList = {
    org_employee: ['org_employee', 'vx_employee_trial'],
    vx_employee_trial: ['org_employee', 'vx_employee_trial'],
    vx_employee_resign: ['vx_employee_resign'],
    vx_employee_transfer: ['vx_employee_transfer'],
    vx_employee_regular: ['vx_employee_regular'],
  }

  constructor(private router: Router, private route: ActivatedRoute, private hrEidtSrv: HrEditService) {}

  ngOnInit(): void {
    const rt$ = this.router.events.pipe(filter(e => e instanceof ActivationEnd))

    this.scp$ = this.route.queryParams
      .pipe(
        tap(rt => {
          this.operat = rt['type']
          this.editId = rt['id']
          this.source = rt['source']

          this.retnTitle = this.source ? this.prantTitle[this.source] : this.prantTitle[this.operat]
          this.redirect = this.source ? (this.source === 'inser' ? '/hr/inservice' : '/hr/dismiss') : '/hr/entry'
        }),
        mergeMap(() => this.hrEidtSrv.personData),
        tap((dat: any) => {
          if (typeof dat === 'object') {
            this.personDat = dat
            this.tabs = this.formatTabs(dat)
          }
        }),
        tap(() => this.setActive()),
        mergeMap(() => rt$),
      )
      .subscribe(() => this.setActive())
  }

  private setActive(): void {
    const idx = this.tabs.findIndex(w => w.key === this.urlKey)
    if (idx !== -1) {
      this.pos = idx
    }
  }

  to(item: { key: string }): void {
    if (!this.operat) {
      return
    }

    const pm = { type: this.operat }

    if (this.editId) {
      pm['id'] = this.editId
    }

    if (this.source) {
      pm['source'] = this.source
    }

    this.router.navigate([`/hr/edit/${item.key}`], { queryParams: pm })
  }

  formatTabs(dat: any): EmpTabs[] {
    const url = this.router.url
    this.urlKey = url.includes('?')
      ? this.router.url.substring(this.router.url.lastIndexOf('/') + 1, this.router.url.lastIndexOf('?'))
      : this.router.url.substr(this.router.url.lastIndexOf('/') + 1)

    let list = ['look', 'edit'].includes(this.operat)
      ? Object.keys(dat)
      : Object.keys(dat).filter(key => this.tabsList[this.urlKey].includes(key))

    if (this.source === 'inser') {
      list = list.filter(key => key !== 'vx_employee_resign')
    }

    return list.map(key => {
      return {
        key,
        tab: dat[key].displayName,
        disabled: false,
      }
    })
  }

  reditTo() {
    this.hrEidtSrv.clearEmpBase()

    this.router.navigate([this.redirect])
  }

  ngOnDestroy(): void {
    this.scp$.unsubscribe()
  }
}
