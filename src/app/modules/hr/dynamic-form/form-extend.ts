import { BaseControl } from './form-base'

/** input类，默认文本类型 */
export class TextBox extends BaseControl<string> {
  controlType = 'textbox'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/** textarea类 */
export class TextArea extends BaseControl<string> {
  controlType = 'textarea'
  rows: number
  constructor(options: {} = {}) {
    super(options)
    this.rows = options['rows'] || 1
  }
}

/** NumberInput */
export class NumberInput extends BaseControl<string> {
  controlType = 'number'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/**
 * 日期型(年)
 */
export class DateYInput extends BaseControl<string> {
  controlType = 'date_y'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/**
 * 日期类型(年月)
 */
export class DateYmInput extends BaseControl<string> {
  controlType = 'date_ym'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/**
 * 日期类型(年月日)
 */
export class DateInput extends BaseControl<string> {
  controlType = 'date_ymd'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/**
 * 日期时间型
 */
export class DateTimeInput extends BaseControl<string> {
  controlType = 'date_datetime'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/**
 * 时间型
 */
export class TimeInput extends BaseControl<string> {
  controlType = 'date_time'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/** 常用参数 */
export class NormalParamInput extends BaseControl<string> {
  controlType = 'normal_param'
  type: string

  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

/** 系统控件 */
export class SysControlInput extends BaseControl<string> {
  controlType = 'sys_control'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}

export class DimensionInput extends BaseControl<string> {
  controlType = 'dimension'
  type: string
  constructor(options: {} = {}) {
    super(options)
    this.type = options['type'] || ''
  }
}
