import { Injectable } from '@angular/core'
import { AbstractControl, ValidatorFn } from '@angular/forms'

@Injectable({
  providedIn: 'root',
})
export class ValidFromService {
  /** 自定义验证  */
  customValid(regExp: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const val = control.value
      if (typeof val === 'string' && !val.length) {
        return null
      }
      const isMatch = regExp.test(val)
      return isMatch ? null : { value: control.value }
    }
  }

  /** 证件号码  */
  idcardValid(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // 获取到输入框的值
      let pIdcard: string

      if (!control.value) {
        return null
      }

      if (typeof control.value === 'string') {
        pIdcard = control.value.toUpperCase()
      } else {
        return { rule: '身份证号码只能是string' }
      }

      // 判断是是否为15位数字、18为纯数字、以及17+X的身份证号码
      const result = pIdcard.match(/\d{15}$|\d{18}$|\d{17}(\d|X)$/gu)

      if (!result) {
        return { rule: '身份证号码位数或格式不对!' }
      }

      // 出生日期验证
      let reg
      let arrSplit

      if (pIdcard.length === 15) {
        reg = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/u
        arrSplit = pIdcard.match(reg)
        arrSplit[2] = '19' + arrSplit[2].toString()
        // 检查生日日期是否正确
      } else {
        reg = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/u
        arrSplit = pIdcard.match(reg) // 检查生日日期是否正确
      }

      if (!arrSplit) {
        return { rule: '身份证号码位数或格式不对!' }
      }

      const dtmBirth = new Date(arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4])

      const bGoodDay =
        dtmBirth.getFullYear() === Number(arrSplit[2]) &&
        dtmBirth.getMonth() + 1 === Number(arrSplit[3]) &&
        dtmBirth.getDate() === Number(arrSplit[4])
      if (!bGoodDay) {
        return { rule: '身份证号码出生日期格式不对!' }
      }

      const area = {
        11: '北京',
        12: '天津',
        13: '河北',
        14: '山西',
        15: '内蒙古',
        21: '辽宁',
        22: '吉林',
        23: '黑龙江',
        31: '上海',
        32: '江苏',
        33: '浙江',
        34: '安徽',
        35: '福建',
        36: '江西',
        37: '山东',
        41: '河南',
        42: '湖北',
        43: '湖南',
        44: '广东',
        45: '广西',
        46: '海南',
        50: '重庆',
        51: '四川',
        52: '贵州',
        53: '云南',
        54: '西藏',
        61: '陕西',
        62: '甘肃',
        63: '青海',
        64: '宁夏',
        65: '新疆',
        71: '台湾',
        81: '香港',
        82: '澳门',
        83: '台湾', // 新中华人民共和国台湾居民居住证
        91: '国外',
      }

      // 地区检验
      if (!area[parseInt(pIdcard.substr(0, 2), 10)]) {
        return { rule: '身份证地区非法!' }
      }

      if (pIdcard.length === 15) {
        return null
      }

      // 校验码验证
      const arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] // 加权因子
      const arrValid = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'] // 校验码

      let sum = 0

      for (let i = 0; i < pIdcard.length - 1; i += 1) {
        // 对前17位数字与权值乘积求和
        sum += parseInt(pIdcard.substr(i, 1), 10) * arrExp[i]
      }
      // 计算模（固定算法）
      const idx = sum % 11
      // 检验第18为是否与校验码相等
      if (arrValid[idx] !== pIdcard.substr(17, 1).toUpperCase()) {
        return { rule: '身份证号码校验错误!' }
      }

      return null
    }
  }

  /**
   * 移动号段：
   * 134 135 136 137 138 139 147 148 150 151 152 157 158 159 165 172 178 182 183 184 187 188 195 198
   * 联通号段：
   * 130 131 132 145 146 155 156 166 167 171 175 176 185 186
   * 电信号段：
   * 133 149 153 162 173 174 177 180 181 189 191 193 199
   * 虚拟运营商:
   * 170
   */
  mobilePhoneValid(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // 获取到输入框的值
      let val: string

      if (!control.value) {
        return null
      }

      if (typeof control.value === 'number') {
        val = control.value.toString()
      } else if (typeof control.value === 'string') {
        val = control.value
      } else {
        return { rule: '手机号码只能是number或者string' }
      }

      // 手机号码校验规则
      const reg = /^(13[0-9]|14[5-9]|15[012356789]|16[2567]|17[0-8]|18[0-9]|19[13589])[0-9]{8}$/u

      if (!reg.test(val)) {
        return { rule: '手机号码格式不正确!' }
      }
      return null
    }
  }

  /**
   * 统一社会信用代码校验
   */
  usccValid(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // 获取到输入框的值
      let val: string

      if (!control.value) {
        return null
      }

      if (typeof control.value === 'string') {
        val = control.value.toUpperCase()
      } else {
        return { rule: '统一社会信用代码只能是string' }
      }

      // 统一社会信用代码校验规则
      const reg = /^[^_IOZSVa-z\W]{2}\d{6}[^_IOZSVa-z\W]{10}$/gu

      if (!reg.test(val)) {
        return { rule: '统一社会信用代码格式不正确!' }
      }
      return null
    }
  }

  /**
   * 邮政编码判断
   */
  zipValid(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // 获取到输入框的值
      let val: string

      if (!control.value) {
        return null
      }

      if (typeof control.value === 'number') {
        val = control.value.toString()
      } else if (typeof control.value === 'string') {
        val = control.value
      } else {
        return { rule: '邮政编码只能是number或者string' }
      }

      // 校验规则
      const reg = /^[1-9][0-9]{5}$/u

      if (!reg.test(val)) {
        return { rule: '邮政编码格式不正确!' }
      }
      return null
    }
  }
}
