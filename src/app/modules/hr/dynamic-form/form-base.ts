export class BaseControl<T> {
  value: T
  key: string
  label: string
  required: boolean
  readOnly: boolean
  order: number
  controlType: string
  placeholder: string
  errorTip: string
  selectionList: any[]
  length: number
  precision: number
  isBuiltIn: boolean
  isEditDisabled: boolean
  constructor(
    options: {
      value?: T
      key?: string
      label?: string
      required?: boolean
      readOnly?: boolean
      order?: number
      controlType?: string
      placeholder?: string
      errorTip?: string
      selectionList?: any[]
      length?: number
      precision?: number
      isBuiltIn?: boolean
      isEditDisabled?: boolean
    } = {},
  ) {
    this.value = options.value
    this.key = options.key || ''
    this.label = options.label || ''
    this.required = !!options.required
    this.readOnly = !!options.readOnly
    this.order = options.order === undefined ? 1 : options.order
    this.controlType = options.controlType || ''
    this.placeholder = options.placeholder || ''
    this.errorTip = options.errorTip || ''
    this.selectionList = options.selectionList || []
    this.length = options.length || 50
    this.precision = options.precision || 0
    this.isBuiltIn = options.isBuiltIn
    this.isEditDisabled = options.isEditDisabled
  }
}
