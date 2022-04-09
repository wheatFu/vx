import { Injectable } from '@angular/core'
import { _HttpClient } from '@knz/theme'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { UserOpts } from '../interfaces/organization.model'

@Injectable()
export class OrganizationService {
  constructor(private http: _HttpClient, private nghttp: HttpClient) {}

  /** 获取组织树结构 */
  getOrganizationTree(params = {}): Observable<any> {
    const url = '/vx/organization/getOrganizationTree'
    return this.http.post(url, params)
  }

  /** 获取组织列表 */
  getOrganizationList(params = {}): Observable<any> {
    const url = '/vx/organization/listByPage'
    return this.http.post(url, params)
  }
  /** 未生效组织列表-变更历史列表 */
  getNoteffectList(params = {}): Observable<any> {
    const url = '/vx/organization/history/listByPage'
    return this.http.post(url, params)
  }

  /** 删除单条组织-变更历史 */
  delHisOrganization(id: string): Observable<any> {
    const url = `/vx/organization/history/${id}/delete`
    return this.http.post(url, {})
  }

  /** 删除组织 */
  delOrganization(id: string): Observable<any> {
    const url = `/vx/organization/delete/${id}`
    return this.http.post(url, {})
  }
  /** 撤销组织 */
  cancelOrganization(id: string): Observable<any> {
    const url = `/vx/organization/history/${id}/cancel`
    return this.http.post(url, {})
  }

  /** 根据id获取单个组织实体 */
  getOrninfoById(id: string): Observable<any> {
    const url = `/vx/organization/${id}`
    return this.http.get(url)
  }
  /** 组织变动查询列表 */
  getOrganizationChangeList(params?: {}): Observable<any> {
    const url = '/vx/organization/change/listByPage'
    return this.http.post(url, params)
  }
  /** 启用/禁用 */
  updateOrganizationStatus(params: any): Observable<any> {
    const url = '/vx/organization/update/status'
    return this.http.post(url, params)
  }

  /** 变更、编辑保存 */
  updateOrganization(params: {}): Observable<any> {
    const url = '/vx/organization/update'
    return this.http.post(url, params)
  }
  /** 新增组织 */
  addOrganization(params: {}): Observable<any> {
    const url = '/vx/organization/create'
    return this.http.post(url, params)
  }
  /** 组织变更历史 详情 */
  getHisDetailList(id: string): Observable<any> {
    const url = `/vx/organization/history/${id}/detail`
    return this.http.get(url)
  }
  /** 组织变更类型，下拉列表项 */
  organizationUpdateTypeList(): Observable<any> {
    const url = '/vx/organization/change/changeTypes'
    return this.http.get(url)
  }
  /** 组织变动查询 查看详情 */
  organizationUpdateDetail(id: string): Observable<any> {
    const url = `/vx/organization/change/${id}/detail`
    return this.http.get(url)
  }
  /** 获取组织架构树 额外信息 */
  getTreeExtdat(params: string[]): Observable<any> {
    const url = `/vx/organization/tree/extData`
    return this.http.post(url, params)
  }

  /** 合并组织 */
  mergeOrg(params: any): Observable<any> {
    const url = '/vx/organization/merge'
    return this.http.post(url, params)
  }

  /** 获取雇员列表 */
  getEmployeesList(id: string): Observable<any> {
    const url = `/vx/organization/${id}/employees`
    return this.http.get(url)
  }

  /** 获取职位列表  */
  getPositionsList(id: string): Observable<any> {
    const url = `/vx/organization/${id}/positions`
    return this.http.get(url)
  }

  /** 根据name模糊查询员工列表  */
  getUser(name: string): Observable<UserOpts[]> {
    const url = `/vx/organization/employees/name?name=${name}`
    return this.http.get(url).pipe(
      map(res => {
        return res.data && res.data.length ? res.data : []
      }),
    )
  }

  /** 组织id列表，批量获取对应组织本级的职位列表  */
  getBatchPosList(params: { organizationIds: string[] }): Observable<any> {
    const url = `/vx/organization/orgIds/positions`
    return this.http.post(url, params)
  }

  /** 组织变动查询 导出 */
  exportChangeList(params): Observable<any> {
    const url = `/vx/organization/change/list/export`
    // 添加 observe 选项来告诉 HttpClient，想要完整的响应对象     responseType: 'blob' 表示返回的是文件流
    return this.nghttp.post(url, params, { responseType: 'blob', observe: 'response' })
  }
  /** 组织列表 导出 */
  exportOrganizationList(params): Observable<any> {
    const url = `/vx/organization/list/export`
    // 添加 observe 选项来告诉 HttpClient，想要完整的响应对象     responseType: 'blob' 表示返回的是文件流
    return this.nghttp.post(url, params, { responseType: 'blob', observe: 'response' })
  }

  /** 根据当前用户上下文，过滤出指定Table的数据字典及参数信息 */
  getDict(tableName: string): Observable<any> {
    const url = `/organization/data/dictionary/${tableName}`
    return this.http.get(url)
  }
}
