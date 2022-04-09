import { Injectable } from '@angular/core'
import { _HttpClient } from '@knz/theme'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as moment from 'moment'
import {
  CREDENTIAL_TYPE_MAP_CHINESE,
  GENDER_MAP_CHINESE,
  GENDER_MAP_DEFAULT_AVATAR,
  NEED2TRANSFORMED,
  STATUS_MAP_CHINESE,
} from '../interfaces/hr.model'
import { environment } from '@env/environment'

/**
 * @params: birth:出生日期
 * @description :根据出生日期，计算年龄
 * @return: 年龄
 */
function _calculate_age(birth) {
  if (!birth) return
  const date = new Date()
  const _CURRENT_YEAR = date.getFullYear()
  const _CURRENT_MONTH = date.getMonth()
  const _CURRENT_DAY = date.getDate()
  const [_B_YEAR, _B_MONTH, _B_DAY] = birth.split('-')
  if (+_B_MONTH < +_CURRENT_MONTH || (+_B_MONTH === +_CURRENT_MONTH && +_B_DAY < +_CURRENT_DAY)) {
    return +_CURRENT_YEAR - +_B_YEAR + 1
  }
  return +_CURRENT_YEAR - +_B_YEAR
}
@Injectable()
export class HrService {
  constructor(private http: _HttpClient, private nghttp: HttpClient) {}

  /** 获取预入职员工列表 */
  getEmployeeList(params = {}): Observable<any> {
    const url = '/vx/employee/pre/listByPage'
    return this.http.post(url, params)
  }

  /** 删除未办理状态的对象  */
  delEmployee(id: string): Observable<any> {
    const url = `/vx/employee/pre/${id}/delete`
    return this.http.post(url)
  }

  /** 入职保存 */
  saveEmployee(params = {}): Observable<any> {
    const url = '/vx/employee/pre/save/temp'
    return this.http.post(url, params)
  }
  /** 入职办理 */
  createEmployee(params = {}): Observable<any> {
    const url = '/vx/employee/pre/create'
    return this.http.post(url, params)
  }
  /** 员工信息更新 */
  updateEmployee(params = {}): Observable<any> {
    const url = '/vx/employee/regular/update'
    return this.http.post(url, params)
  }

  /** 获取自定义表单数据 */
  getFormDynamic(params = {}): Observable<any> {
    const url = '/vx/employee/data/extDictionary/org_employee'
    return this.http.post(url, params)
  }

  /** 获取组织职位受否关联模式 */
  getisRelated(): Observable<boolean> {
    const url = '/vx/position/org/isRelated'
    return this.http.get(url).pipe(map(res => !!(res && res.data)))
  }

  /** 获取单个组织 */
  getOrgById(id: string): Observable<any> {
    const url = `/vx/organization/${id}`
    return this.http.get(url)
  }
  /** 获取单个员工基础信息 */
  getEmpBaseById(id: string): Observable<any> {
    const url = `/vx/employee/pre/${id}`
    return this.http.get(url)
  }
  /** 获取在职员工基础信息 */
  getEmpRegularById(id: string): Observable<any> {
    const url = `/vx/employee/regular/${id}`
    return this.http.get(url)
  }
  /** 获取员工试用期信息--未入职 */
  getPreTrialById(id: string): Observable<any> {
    const url = `/vx/employee/trial/pre/${id}`
    return this.http.get(url)
  }
  /** 获取员工试用期信息--入职 */
  getEmpTrialById(id: string): Observable<any> {
    const url = `/vx/employee/trial/emp/${id}`
    return this.http.get(url)
  }

  /** 离职明细 */
  getEmpResignInfoById(id: string): Observable<any> {
    const url = `/vx/employee/resign/info/${id}`
    return this.http.get(url)
  }
  /** 转正明细 */
  getEmpRegularInfoById(id: string): Observable<any> {
    const url = `/vx/employee/regular/info/${id}`
    return this.http.get(url)
  }

  /** 获取员工头像 */
  getEmpAvatarImg(fileId: string) {
    const url = `/file/www/${fileId}`

    return this.nghttp.get(url, { responseType: 'blob' })
  }

  /** 获取员工调动列表 */
  getEmpTransferList(params = {}): Observable<any> {
    const url = '/vx/employee/transfer/listByPage'
    return this.http.post(url, params)
  }

  /***----------------------员工历史------start--------------------------**/
  /** 变更类型列表 */
  getChangeTypeList(): Observable<any> {
    const url = `/vx/employee/change/history/changeType/list`
    return this.http.get(url)
  }
  /** 导出 */
  exportHistoryRecords(params = {}): Observable<any> {
    const url = `/vx/employee/change/history/export`
    return this.http.post(url, params)
  }
  /** 查询员工变更历史列表 */
  getChangeHistoryList(params = {}): Observable<any> {
    const url = `/vx/employee/change/history/listByPage`
    return this.http.post(url, params).pipe(
      map(res => {
        let { data } = res
        data =
          data.map(item => {
            const { createTime, changeContent } = item
            return {
              ...item,
              createTime: moment(createTime).format('YYYY/MM/DD HH:mm'),
              changeContent: Array.isArray(changeContent.changeList)
                ? {
                    // tslint:disable-next-line:no-shadowed-variable
                    changeList: changeContent.changeList.map(item => {
                      const attribute = item.attribute.replace(/\W/gi, '')
                      return {
                        ...item,
                        oldValue: NEED2TRANSFORMED[attribute]
                          ? NEED2TRANSFORMED[attribute][item.oldValue]
                          : item.oldValue,
                        newValue: NEED2TRANSFORMED[attribute]
                          ? NEED2TRANSFORMED[attribute][item.newValue]
                          : item.newValue,
                      }
                    }),
                  }
                : {
                    ...changeContent,
                    profile: changeContent.profile
                      ? `${environment.SERVER_URL}/file/www/${changeContent.profile}`
                      : GENDER_MAP_DEFAULT_AVATAR[changeContent.gender],
                    sex: GENDER_MAP_CHINESE[changeContent.gender],
                    credentialType: CREDENTIAL_TYPE_MAP_CHINESE[changeContent.credentialType],
                    status: STATUS_MAP_CHINESE[changeContent.status],
                    resignDate: moment(changeContent.resignDate).format('YYYY/MM/DD'),
                    regularDate: moment(changeContent.regularDate).format('YYYY/MM/DD'),
                    age: _calculate_age(changeContent.birth),
                  },
            }
          }) || []
        return {
          ...res,
          data,
        }
      }),
    )
  }
  /***----------------------员工历史------end--------------------------**/
  /***----------------------离职员工管理------start--------------------------**/
  /** 离职员工列表 */
  getResignList(params = {}): Observable<any> {
    const url = `/vx/employee/resign/listByPage`
    return this.http.post(url, params)
  }
  /** 离职类型列表 */
  getResignTypeList(): Observable<any> {
    const url = `/vx/employee/resign/type/list`
    return this.http.get(url)
  }
  /** 离职员工保存 */
  saveToResign(params = {}): Observable<any> {
    const url = `/vx/employee/resign`
    return this.http.post(url, params)
  }
  /** 导出 */
  exportResignedTemplate(params = {}): Observable<any> {
    const url = `/vx/employee/resign`
    return this.http.post(url, params)
  }
  /***----------------------离职员工管理------end--------------------------**/
  /***----------------------在职员工管理------start--------------------------**/
  /** 转正类型 */
  getRegularTypeList() {
    const url = '/vx/employee/regular/type/list'
    return this.http.get(url)
  }
  /** 获取员工信息详情 */
  getEmployeeInfo(id?: string): Observable<any> {
    const url = `/vx/employee/regular/${id}`
    return this.http.get(url)
  }
  /** 在职员工列表 */
  getInServiceList(params = {}): Observable<any> {
    const url = `/vx/employee/regular/listByPage`
    return this.http.post(url, params)
  }
  /** 员工转正  保存 */
  saveToBecomeRegular(params = {}): Observable<any> {
    const url = `/vx/employee/regular`
    return this.http.post(url, params)
  }
  /** 根据员工id获取人员汇报图 */
  getPersonnelReportChartById(employeeId: string) {
    const url = `/vx/employee/regular/reportTree/personnel`
    return this.http.get(url, { employeeId })
  }
  /** 根据员工id获取职位汇报图 */
  getPositionReportChartById(employeeId: string) {
    const url = `/vx/employee/regular/reportTree/position`
    return this.http.get(url, { employeeId })
  }
  /** 导出 */
  exportListTemplate(params = {}) {
    const url = `/vx/employee/regular/reportTree/position`
    return this.http.post(url, params)
  }
  /***----------------------在职员工管理------end----------------------------**/

  /***----------------------员工调动------start--------------------------**/
  /** 离职员工列表 */
  saveToTransfer(params = {}): Observable<any> {
    const url = `/vx/employee/transfer`
    return this.http.post(url, params)
  }
  getTransferList(params = {}) {
    const url = `/vx/employee/transfer/listByPage`
    return this.http.post(url, params)
  }
  /***----------------------员工调动------end--------------------------**/
}
