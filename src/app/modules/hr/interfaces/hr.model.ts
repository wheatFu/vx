import { FormGroup } from '@angular/forms'
export type EditUrlKey =
  | 'org_employee'
  | 'vx_employee_trial'
  | 'vx_employee_resign'
  | 'vx_employee_transfer'
  | 'vx_employee_regular'

export type EditBaseForm = {
  [key in 'org_employee' | 'vx_employee_trial']: {
    form: FormGroup
    val: any
    sys?: any
  }
}

export type Avatar = {
  [key in 'avatarId' | 'avatarUrl']: string
}

export interface EmpTabs {
  key: string
  tab: string
  disabled?: boolean
}
export enum GENDER_MAP_DEFAULT_AVATAR {
  MAN = './assets/images/employee.png',
  WOMAN = './assets/images/female.png',
}
export enum GENDER_MAP_CHINESE {
  MAN = '男',
  WOMAN = '女',
}
export enum CREDENTIAL_TYPE_MAP_CHINESE {
  ID_CARD = '身份证',
  PASSPORT = '护照',
  EEP_HK_AND_MACAO = '港澳通行证',
  EEP_TAIWAN = '台湾通行证',
  HK_ID_CARD = '香港永久居民身份证',
  MACAO_ID_CARD = '澳门居民身份证',
  TAIWAN_ID_CARD = '台湾居民身份证',
}
export enum STATUS_MAP_CHINESE {
  INSERVICE = '在职',
  DIMISSION = '离职',
}
export interface EmployeeData {
  id: string
  name: string
  positionName: string
  organizationName: string
  profile: string // 头像
  positionId: string
  organizationId: string
  reportTo: string // 汇报人id
  reportToName: string // 汇报人名称
}
export enum DataState {
  LOADING = 1,
  EMPTY = 2,
  EXIST_DATA = 3,
}
/** 详情返回数据结构 */
export interface ChangeResData {
  changeType: string
  createBy: string
  createTime: string
  changeContent: ChangeTransfer | ChangeRegular | ChangeResign | ChangePre | ChangeInformation
}
/** 调动 */
export interface ChangeTransfer {
  old_organizationName: string
  old_positionName: string
  old_reportToName: string
  organizationName: string
  positionName: string
  reportToName: string
}

/** 离职 */
export interface ChangeResign {
  resignDate: string
  resignTypeValue: string
  resignReason: string
}

/** 转正 */
export interface ChangeRegular {
  regularTypeValue: string
  regularComments: string
  regularDate: string
}
/** 入职 */
export interface ChangePre {
  code: string
  organizationName: string
  name: string
  positionName: string
  reportToName: string
  hireDate: string
  idNo: string
  email: string
  sex: string
  mobile: string
  birth: string
  status: string
  credentialType: string
  age: string
  profile: string // 头像
}
/** 信息变更 */
export interface ChangeInformation {
  changeList: AttributeVo[]
}
interface AttributeVo {
  attribute: string
  oldValue: string
  newValue: string
}
/** 需要转译的字段 */
export const NEED2TRANSFORMED = {
  gender: GENDER_MAP_CHINESE,
  credentialType: CREDENTIAL_TYPE_MAP_CHINESE,
  probationaryStatus:{
    'true':'是',
    'false':'否'
  },
  status:STATUS_MAP_CHINESE
}
