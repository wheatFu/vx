import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
@Injectable()
export class PositionService {
  constructor(private http: HttpClient) {}
  // /vx/position/listByRule
  /** 获取职位列表,关联组织，则调用此职位列表接口 */
  getPositionListByRule(params = {}): Observable<any> {
    const url = '/vx/position/listByRule'
    return this.http.post(url, params)
  }
  /** 获取职位列表,不关联组织，则调用此职位列表接口 */
  getPositionList(params = {}): Observable<any> {
    const url = '/vx/position/listByPage'
    return this.http.post(url, params)
  }
  /** 导出所有职位 */
  exportAllPosition(params = {}): Observable<any> {
    const url = '/vx/position/list/export'
    // 添加 observe 选项来告诉 HttpClient，想要完整的响应对象     responseType: 'blob' 表示返回的是文件流
    return this.http.post(url, params, { responseType: 'blob', observe: 'response' })
  }
  /** 是否关联组织 */
  isRelatedOrganization(): Observable<any> {
    const url = '/vx/position/org/isRelated'
    return this.http.get(url)
  }
  /** 是否关联组织 */
  deletePosition(params): Observable<any> {
    const url = `/vx/position/${params.id}/delete`
    return this.http.post(url, {})
  }
  /** 根据id启用、禁用职位 */
  setPositionStatus(params): Observable<any> {
    const url = `/vx/position/${params.id}/update/status?status=${params.status}`
    return this.http.post(url, {})
  }
  /** 根据id获取职位详情信息 */
  getPositionInfoById(id): Observable<any> {
    const url = `/vx/position/${id}`
    return this.http.post(url, {})
  }
  /** 变更、编辑保存 */
  updatePosition(params: {}): Observable<any> {
    const url = '/vx/position/update'
    return this.http.post(url, params)
  }
  /** 新增职位 */
  addPosition(params: {}): Observable<any> {
    const url = '/vx/position/create'
    return this.http.post(url, params)
  }
  /** 获取所属部门信息 */
  getOrganizationInfo(params: {}): Observable<any> {
    const url = '/vx/organization/type/data/list'
    return this.http.post(url, params)
  }
  /** 根据职位编码获取对应的在职员工列表 */
  getEmployeeList(params): Observable<any> {
    const url = `/vx/position/employee/list`
    return this.http.post(url, params)
  }
  //
  /** 根据组织信息查询对应的职位汇报关系 */
  getGraphDataByOrganInfo(params = {}): Observable<any> {
    const url = `/vx/position/list/report/tree`
    return this.http.post(url, params)
  }
  /** 获取组织树结构 */
  getOrganizationTree(params = {}): Observable<any> {
    const url = '/vx/organization/getOrganizationTree'
    return this.http.post(url, params)
  }
}
