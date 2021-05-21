import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'boolePipe',
})
export class BoolePipePipe implements PipeTransform {
  transform(value: boolean | string, exp?: string): string {
    if (!exp) {
      return value ? '是' : typeof value === 'string' ? '未知' : '否'
    }

    return value === exp ? '是' : '否'
  }
}
