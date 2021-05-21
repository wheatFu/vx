import { TreeGraphData } from '@antv/g6'

/** 职位data */
export interface TreeSourceOpts {
  id: string
  name: string
  childPositions?: TreeSourceOpts[]
  organizationDimensionId: string
  organizationId: string
  organizationName: string
  employeeNum: string,
  zoom:number|string
}

/** 职位架构图数据结构 */
export interface PositionTreeGraphDat extends TreeGraphData {
  id:string
  employeeNum: string | number // 人员数/在职员工数
  bgColor: string // 背景色

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
