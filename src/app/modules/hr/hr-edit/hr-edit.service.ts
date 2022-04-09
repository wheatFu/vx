import { Injectable } from '@angular/core'
import { _HttpClient } from '@knz/theme'
import * as moment from 'moment'
import { Observable, of } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { Avatar, EditBaseForm } from '../interfaces/hr.model'
import { HrService } from '../service/hr.service'

@Injectable()
export class HrEditService {
  /** 动态表数据字典 */
  personDataTmp: any

  /** 组织关联模式 */
  isRelatedTmp: boolean

  /** 保存基本信息 */
  private editBaseForm: EditBaseForm = {
    org_employee: { form: null, val: null, sys: null },
    vx_employee_trial: { form: null, val: null, sys: null },
  }

  /** 头像 */
  private _avatar: Avatar = {
    avatarId: null,
    avatarUrl: null,
  }

  constructor(private http: _HttpClient, private hrSrv: HrService) {}

  /** 获取人员相关表的数据字典结构 */
  getDictWithPerson(): Observable<any> {
    const url = '/vx/organization/data/dictionary/getDataDictionaryWithPersonnel'
    return this.http.get(url).pipe(
      tap(res => {
        if (!res.data || !res.result || !(res.result.code === 0)) {
          const msg = (res.result && res.result.message) || '获取员工信息错误'
          throw new Error(msg)
        }
      }),
      map(res => res.data),
      tap(data => (this.personDataTmp = data)),
    )
  }

  /** 获取表单列 */
  get personData(): Observable<any> {
    if (this.personDataTmp) {
      return of(this.personDataTmp)
    } else {
      return this.getDictWithPerson()
    }
  }

  /** 获取表单具体下拉 */
  getParamConfig(param: { tableName: string; columName?: string }): Observable<any> {
    const url = '/vx/organization/data/dictionary/getTableParamConfigValue'
    return this.http.post(url, param)
  }

  /** 组织关联模式 */
  get isRelated(): Observable<boolean> {
    if (typeof this.isRelatedTmp === 'undefined') {
      return this.hrSrv.getisRelated().pipe(
        tap(boo => {
          this.isRelatedTmp = boo
        }),
      )
    } else {
      return of(this.isRelatedTmp)
    }
  }

  /**
   * 保存数据
   * 员工信息与试用期信息共享
   * type: '1' 初始化值, '2' 修改值
   */

  changeEmpBase(type: string, pdata: Partial<EditBaseForm>): void {
    const base_val = (this.editBaseForm.org_employee && this.editBaseForm.org_employee.val) || null
    const trial_val = (this.editBaseForm.vx_employee_trial && this.editBaseForm.vx_employee_trial.val) || null

    if (!base_val && !trial_val) {
      this.editBaseForm = pdata as EditBaseForm
      return
    }

    this.editBaseForm = type === '1' ? { ...pdata, ...this.editBaseForm } : { ...this.editBaseForm, ...pdata }

    console.log(this.editBaseForm)
  }

  get empBaseForm(): EditBaseForm {
    const base = this.editBaseForm.org_employee
    const trial = this.editBaseForm.vx_employee_trial

    if (base && base.val) base.val = { ...base.val, ...this.formatDate(base.val) }
    if (trial && trial.val) trial.val = { ...trial.val, ...this.formatDate(trial.val) }

    return this.editBaseForm
  }

  private formatDate(obj: any): any {
    const newObj: any = {}
    Object.keys(obj).map(key => {
      if (obj[key] instanceof Date) {
        newObj[key] = moment(obj[key]).format('YYYY-MM-DD')
      }
    })

    return newObj
  }

  /** 重置共享数据 */
  clearEmpBase(): void {
    this.editBaseForm = {
      org_employee: { form: null, val: null, sys: null },
      vx_employee_trial: { form: null, val: null, sys: null },
    }

    this._avatar = {
      avatarId: null,
      avatarUrl: null,
    }
  }

  /** 改变头像 */
  changeAvatar(ava: Avatar): void {
    this._avatar = { ...this._avatar, ...ava }
  }

  get avatar(): Avatar {
    return this._avatar
  }

  /** 上传头像 */
  uploadAvatar(param: any) {
    const url = '/file/upload'
    return this.http.post(url, param)
  }
}
