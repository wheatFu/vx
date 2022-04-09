import { TreeGraphData } from '@antv/g6'

/** 组织data */
export interface TreeSourceOpts {
  id: string
  name: string
  isRoot: boolean
  subOrganizations?: TreeSourceOpts[]
  isDisable?: boolean
  organizationDimensionId: string
  region: string // 区域
  type: string
  status: string
  level?: number
  superiorId?: string
  superior?: TreeSourceOpts
  [prop: string]: unknown
}

/** 组织架构图数据结构 */
export interface OrTreeGraphDat extends TreeGraphData {
  position: string // 职位
  ygs: string | number // 员工数
  zws: string | number // 职位数量
  bgColor: string // 背景色
  level?: number
}

/** 组织图额外数据 */
export interface GraphExtdata {
  [key: string]: GraphExtdataMx
}
/** 组织图额外数据 - 具体字段 */
export interface GraphExtdataMx {
  employeeNum: number
  id: string
  managers: string
  positionNum: number
}

/** 加载列表状态 */
export enum DataState {
  LOADING = 1,
  EMPTY = 2,
  EXIST_DATA = 3,
}

/** 操作状态 */
export enum OperatList {
  add = '新建组织',
  edit = '编辑组织',
  change = '变更组织',
}

/** 中台树组件返回数据 */
export interface TreeResData {
  key: string
  title: string
  code: string
  pcode: string
  pkey: string
  ptitle: string
}

/** 组织类型 */
export enum ORG_TYPE {
  '1300713302678048770' = '法人主体',
  '1300713386325053441' = '部门',
}

/** 组织状态 */
export enum ORG_STATUS {
  'ENABLE' = '已启用',
  'DISABLE' = '已禁用',
}

/** 组织操作类型 */
export enum CHANGE_TYPE_MAP_CHINESE {
  ORGANIZATION_DELETE = '组织删除',
  ORGANIZATION_CHANGE = '信息变更',
  ORGANIZATION_DISABLE = '组织禁用',
  ORGANIZATION_NEW = '组织新建',
  ORGANIZATION_ENABLE = '组织启用',
  ORGANIZATION_MERGE = '组织合并',
  ORGANIZATION_NULL = '空操作',
}

/** 详情返回数据结构 */
export interface ChangeResData {
  changeType: string
  createBy: string
  createTime: string
  effectiveDate: string
  changeDetail: ChangeResAdd | ChangeResMerge | ChangeResEnble | ChangeResDetail
}

/** 新增删除 */
export interface ChangeResAdd {
  code: string
  name: string
  region: string
  status: string
  superior?: ChangeResAdd
  type: string
  [prop: string]: unknown
}

/** 启用禁用 */
export interface ChangeResEnble {
  effectiveDate: Date
  lastUpdateByUserName: string
  updateTime: Date
}

/** 变更 */
export interface ChangeResDetail extends ChangeResEnble {
  attributeVOList: {
    attributeName: string
    attributeValueAfter: string
    attributeValueBefore: string
  }[]
}

/** 职位 */
export interface ChangeResPosition {
  code: string
  id: string
  isBusinessLineManager: boolean
  isSupervisor: boolean
  name: string
  superior?: ChangeResPosition
  [prop: string]: unknown
}

/** 合并 */
export interface ChangeResMerge extends ChangeResEnble {
  mainOrganizationId: string
  managementPositions: ChangeResPosition[]
  mergedOrganizations: ChangeResAdd[]
}

/** 用户下拉 */
export interface UserOpts {
  id: string
  code: string
  name: string
  userId: string
}
