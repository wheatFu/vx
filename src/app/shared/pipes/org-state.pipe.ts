import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'orgState',
})
export class OrgStatePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'ENABLE':
        return '启用'
      case 'DISABLE':
        return '禁用'
      default:
        return '未知'
    }
  }
}
