/** 动态表单字段 */
export interface Columns {
  columnType: string
  dataType: string
  displayName: string
  columnName: string
  isRequire: boolean
  readOnly: boolean

  length: number

  /**
   * 精度
   */
  precisionValue: number
  type: string
  sort: number

  /**
   * 下拉项才有
   */
  defaultValue?: string

  /**
   * 获取下拉项值id
   */
  coreParamConfigId?: string
  systemControl?: string
  changeType?: string
  [prop: string]: any
}

export interface SelectOpt {
  id: string
  name: string
  state: 'ENABLE' | 'DISABLED'
}
