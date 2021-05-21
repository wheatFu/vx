import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'orgChangeType',
})
export class OrgChangeTypePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'ORGANIZATION_DELETE':
        return '组织删除'
      case 'ORGANIZATION_CHANGE':
        return '信息变更'
      case 'ORGANIZATION_DISABLE':
        return '组织禁用'
      case 'ORGANIZATION_NEW':
        return '组织新建'
      case 'ORGANIZATION_ENABLE':
        return '组织启用'
      case 'ORGANIZATION_MERGE':
        return '组织合并'
      case 'ORGANIZATION_NULL':
        return '空操作'
      default:
        return '未知'
    }
  }
}
