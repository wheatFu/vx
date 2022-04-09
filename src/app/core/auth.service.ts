import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userInfo: UserInfo

  constructor() {}

  getUserInfo() {
    if (this.userInfo != null) return this.userInfo

    let userInfo: UserInfo
    try {
      const userInfoJson = localStorage.getItem('userInfo')
      userInfo = userInfoJson ? JSON.parse(userInfoJson) : {}
    } catch (e) {
      // tslint:disable-next-line:no-object-literal-type-assertion
      userInfo = {} as UserInfo
    }

    return (this.userInfo = userInfo)
  }

  setUserInfo(value: UserInfo) {
    this.userInfo = value
    localStorage.setItem('userInfo', JSON.stringify(value))
  }

  /** 下拉 */
  setSelectData(value: any) {
    localStorage.setItem('dataConfig', JSON.stringify(value))
  }

  /** 获取下拉所有数据 */
  getSelectDataAll() {
    const dataConfig = localStorage.getItem('dataConfig') || ''
    return JSON.parse(dataConfig)
  }

  /** tableConfig @ key:eg: org_organization */
  getSelectTable(key?: string) {
    const data = this.getSelectDataAll()
    if (!key) {
      return data.tableConfig || {}
    } else {
      return data.tableConfig[key]
    }
  }

  /**
   * 获取某一个下拉
   * key table名 {eg: org_organization}
   * cloumname 列明 {eg: status }
   */

  getSelectSole(key: string, cloumname: string) {
    const data = this.getSelectDataAll()

    const { tableConfig: tc, paramConfig: pc } = data

    if (!tc || !tc[key].columns || !tc[key].columns.length) {
      return {}
    }

    const columns = tc[key].columns as any[]
    const config = columns.filter(el => el.columnName === cloumname)

    const [{ coreParamConfigId: configId }] = config

    // 去paramConfig 获取
    if (!configId || !pc.length) {
      return {}
    }

    const item = pc.filter((el: { [x: string]: any }) => {
      return el[configId]
    })
    const dt = item.length ? item[0][configId] : {}
    return dt
  }

  /**
   * 20210803
   * 获取某一个下拉
   * data: 下拉数据源
   * key table名 {eg: org_organization}
   * cloumname 列明 {eg: status }
   */

  getSelectInData(data: DictData, key: string, cloumname: string) {
    const { tableConfig: tc, paramConfig: pc } = data

    if (!tc || !tc[key].columns || !tc[key].columns.length) {
      return {}
    }

    const columns = tc[key].columns as any[]
    const config = columns.filter(el => el.columnName === cloumname)

    const [{ coreParamConfigId: configId }] = config

    // 去paramConfig 获取
    if (!configId || !pc.length) {
      return {}
    }

    const item = pc.filter((el: { [x: string]: any }) => {
      return el[configId]
    })
    const dt = item.length ? item[0][configId] : {}
    return dt
  }
}

/**
 * 用户信息
 */
export interface UserInfo {
  name: string
  isAdmin: boolean
  employee: Employee
  // 用户权限信息
  userRolePageInfoList: UserRolePageInfo[]
  // 默认登录入口
  loginDefaultProductInfo: LoginEntryProduct
}

/**
 * 用户权限列表
 */
export interface UserRolePageInfo {
  createAuthority: boolean
  deleteAuthority: boolean
  exportAuthority: boolean
  importAuthority: boolean
  name: string
  pageId: string
  path: string
  roleId: string
  updateAuthority: boolean
  viewAuthority: boolean
}

/**
 * 默认登录入口（产品 + 产品首页）
 */
export interface LoginEntryProduct {
  id: string
  name: string
  code: string
  sort: number
  indexPageId: string
  indexPage: LoginEntryPage
  pathPrefix: string
  createTime: string
  updateTime: string
  lastUpdateBy: string
  isDeleted: boolean
}

export interface LoginEntryPage {
  id: string
  name: string
  moduleId: string
  /** 前端工程部署路径前缀 */
  prefix: string
  /** 路由 ID */
  routeKey: string
  /**
   * @deprecated
   * TODO: 当前跳转到小闭环，仍然使用老的 `path` 属性，等小闭环实现 ”路由ID“ 时，再使用 `routeKey`
   */
  path: string
}

/**
 * 员工信息
 */
export interface Employee {
  birth: string
  code: string
  createBy: string
  createTime: string
  credentialType: string
  email: string
  gender: string
  hireDate: string
  id: string
  idNo: string
  isDeleted: boolean
  lastUpdateBy: string
  mobile: string
  name: string
  organizationId: string
  organizationName: string
  positionId: string
  positionName: string
  probationaryStatus: boolean
  reportTo: string
  status: string
  updateTime: string
  userId: string
}

/** 数据字典下拉 */
export interface DictData {
  language?: 'ZH_CN' | 'EN'
  tableConfig: {
    [key: string]: {
      columns: any[]
      displayName: 'string'
      relatedObjectTypeString: 'string'
      tableName: 'string'
    }
  }
  paramConfig: any[]
  version?: string
}
