import { Injectable } from '@angular/core'
import { _HttpClient } from '@knz/theme'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'

@Injectable()
export class HolidayService {
  constructor(private http: _HttpClient, private nghttp: HttpClient) {}
  /******** 额度  start***********/
  /** 获取额度列表 */
  getEmployeeList(params = {}): Observable<any> {
    const url = '/vx/holiday/listByPage'
    return this.http.post(url, params)
  }

  /**  table组件标准数据 */
  getTableList(params = {}) {
    const url = '/vx/holiday/tableDemo'
    return this.http.post(url, params)
  }

  /******** 额度  end***********/

  /** 获取组织树结构 */
  getOrganizationTree(params = {}): Observable<any> {
    const url = '/vx/organization/getOrganizationTree'
    return this.http.post(url, params)
  }
  /** 在职员工列表 */
  getInServiceList(params = {}): Observable<any> {
    const url = `/vx/employee/regular/listByPage`
    return this.http.post(url, params)
  }
}
