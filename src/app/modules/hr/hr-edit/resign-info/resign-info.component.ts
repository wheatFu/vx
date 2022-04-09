import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { forkJoin } from 'rxjs'
import { filter, map, mergeMap, tap } from 'rxjs/operators'
import { EditUrlKey } from '../../interfaces/hr.model'
import { HrService } from '../../service/hr.service'
import { HrEditService } from '../hr-edit.service'

/**
 * 只有查看和编辑进入这个页面内
 * 编辑 只能修改员工信息，即这个组件只做离职和转正的查看
 */

@Component({
  selector: 'app-resign-info',
  templateUrl: './resign-info.component.html',
  styleUrls: ['./resign-info.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResignInfoComponent implements OnInit {
  loading = false
  saveLoading = false
  redirectUrl: string
  dataConfig: any
  isRelated = false

  /**
   * 操作类型
   *  edit 编辑 look查看
   */
  operat: string

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

  formDisabled = true

  constructor(
    private hrEidtSrv: HrEditService,
    private hrSrv: HrService,
    public router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getFormDynamic()
  }

  get urlKey(): EditUrlKey {
    const url = this.router.url
    const urlKey = url.includes('?')
      ? this.router.url.substring(this.router.url.lastIndexOf('/') + 1, this.router.url.lastIndexOf('?'))
      : this.router.url.substr(this.router.url.lastIndexOf('/') + 1)

    return urlKey as EditUrlKey
  }
  /**
   * 获取自定义表单数据
   */
  getFormDynamic() {
    this.loading = true

    const tableName = this.urlKey
    const pdata = { tableName, columName: '' }

    this.route.queryParams
      .pipe(
        filter(rt => !!(rt.type || (rt.type !== 'add' && rt.id))),
        tap(rt => {
          this.operat = rt['type']
          this.editId = rt['id'] || ''
          this.source = rt['source']
          this.redirectUrl = this.source === 'inser' ? '/hr/inservice' : '/hr/dismiss'
        }),
        mergeMap(rt =>
          forkJoin(this.hrEidtSrv.isRelated, this.getDetailData(rt['id']), this.hrEidtSrv.getParamConfig(pdata)),
        ),
      )
      .subscribe(
        ([relat, pd, pm]) => {
          this.loading = false
          this.isRelated = relat

          const tmp = { columns: pd }

          const { result, data } = pm
          tmp['paramConfig'] = !result.code && data && data.length ? data : []

          this.dataConfig = tmp
          this.cdr.detectChanges()
        },
        () => {
          this.loading = false
        },
      )
  }

  /** 获取明细数据 */
  getDetailData(id: string) {
    const tableName = this.urlKey
    const add$ = this.hrEidtSrv.personData
    const detail$ =
      this.urlKey === 'vx_employee_resign' ? this.hrSrv.getEmpResignInfoById(id) : this.hrSrv.getEmpRegularInfoById(id)

    return detail$.pipe(
      tap(res => {
        if (res.result.code) {
          throw new Error('获取详细数据失败')
        }
      }),
      map(res => res.data),
      mergeMap(dat => {
        if (dat) {
          return add$.pipe(
            map(res => {
              const oldCoulms = <any[]>res[tableName].columns

              return oldCoulms.map(el => {
                return { ...el, defaultValue: dat[el.columnName] || null }
              })
            }),
          )
        }

        return add$.pipe(map(res => <any[]>res[tableName].columns))
      }),
    )
  }

  doCancel(ev) {
    this.router.navigate([this.redirectUrl])
  }
}
