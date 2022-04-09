import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { BaseControl } from './form-base'
import {
  DateInput,
  DateTimeInput,
  DateYInput,
  DateYmInput,
  DimensionInput,
  NormalParamInput,
  NumberInput,
  SysControlInput,
  TextArea,
  TextBox,
  TimeInput,
} from './form-extend'
import { Columns, SelectOpt } from './form-model'

/**
 * 	直接输入
 */
const COLUMN_TYPE_DIRECT_INPUT = 'DIRECT_INPUT'
/**
 * 常用参数
 */
const COLUMN_TYPE_GENERAL_PARAMETERS = 'GENERAL_PARAMETERS'
/**
 * 系统控件
 */
const COLUMN_TYPE_SYSTEM_CONTROL = 'SYSTEM_CONTROL'

/**
 * 整数型
 */
const DATA_TYPE_INTEGER = 'INTEGER'
/**
 * 浮点型
 */
const DATA_TYPE_FLOAT = 'FLOAT'

/**
 * 时间型
 */
const DATE_TYPE_TIME = 'TIME'

/**
 * 布尔型
 */
const DATA_TYPE_BOOLEAN = 'BOOLEAN'

@Injectable()
export class DynamicFormService {
  /* TODO */
  getTranColums(opts: Columns[], paramConfig: any): Observable<BaseControl<any>[]> {
    const list: BaseControl<any>[] = []

    for (const opt of opts) {
      const {
        columnType,
        dataType,
        displayName,
        columnName,
        defaultValue,
        isRequire,
        readOnly,
        length,
        precisionValue,
        type,
        sort,
        coreParamConfigId,
        systemControl,
        changeType,
      } = opt

      let colType: any // 确认精度等
      let selectList: any[] = []
      if (dataType === DATA_TYPE_BOOLEAN && columnType === COLUMN_TYPE_DIRECT_INPUT) {
        selectList = [
          { id: true, name: '是' },
          { id: false, name: '否' },
        ]
      } else if (columnType === COLUMN_TYPE_GENERAL_PARAMETERS && coreParamConfigId) {
        const item = paramConfig.filter((el: { [x: string]: any }) => {
          return el['columnName'] === columnName
        })
        const seList = (item.length && item[0].paramConfigValueList) || []
        selectList = seList.length ? this.transParam(seList) : []

        colType = changeType
      }

      /**
       * number input
       */
      if (columnType === COLUMN_TYPE_SYSTEM_CONTROL && systemControl) {
        colType = systemControl
      } else if (columnType === COLUMN_TYPE_DIRECT_INPUT && dataType === DATA_TYPE_INTEGER) {
        colType = '1'
      } else if (columnType === COLUMN_TYPE_DIRECT_INPUT && dataType === DATA_TYPE_FLOAT) {
        colType = '0.1'
      }

      /**
       * 下拉
       */

      let tmpDataValue: any = defaultValue || null
      if (COLUMN_TYPE_GENERAL_PARAMETERS === columnType && 'MULTIPLE_CHOICE' === changeType) {
        tmpDataValue = tmpDataValue ? [tmpDataValue] : []
      }

      if (dataType === DATE_TYPE_TIME) {
        tmpDataValue = tmpDataValue ? new Date(tmpDataValue) : null
      }

      if (dataType === DATA_TYPE_BOOLEAN) {
        tmpDataValue = tmpDataValue && tmpDataValue.toString() === 'true' ? true : false
      }

      const obj: any = {
        value: tmpDataValue,
        key: columnName,
        label: displayName,
        required: isRequire,
        readOnly,
        order: sort,
        /**
         * 直接写在控件上
         */
        placeholder: '',
        /**
         * 错误信息不一定是必填，暂时不用
         */
        errorTip: `${displayName}不能为空`,
        selectionList: selectList,
        length,
        precision: precisionValue,
        isBuiltIn: type === 'BUILT_IN',
        isEditDisabled: false,
        type: colType,
      }

      list.push(this.buildWidget(obj, columnType, dataType))
    }

    return of(list.sort((a, b) => a.order - b.order))
  }

  /** 构建各部件 */
  buildWidget(controls: BaseControl<any>, colType: string, dataType: string): any {
    const tmp = {
      SINGLETEXT: new TextBox(controls),
      MULTITEXT: new TextArea(controls),
      MULTITEXT_FORMAT: new TextArea(controls),

      INTEGER: new NumberInput(controls),
      FLOAT: new NumberInput(controls),

      DATE_YEAR: new DateYInput(controls),
      TIME: new TimeInput(controls),

      DATE_YMD: new DateInput(controls),

      DATE_YEAR_MONTH: new DateYmInput(controls),

      DATE_AND_TIME: new DateTimeInput(controls),

      BOOLEAN: new NormalParamInput(controls),
    }

    let widget: any
    switch (colType) {
      case COLUMN_TYPE_DIRECT_INPUT:
        widget = tmp[dataType]
        break
      case COLUMN_TYPE_GENERAL_PARAMETERS:
        widget = new NormalParamInput(controls)
        break
      case COLUMN_TYPE_SYSTEM_CONTROL:
        widget = new SysControlInput(controls)
        break
      case 'DIMENSION':
        widget = new DimensionInput(controls)
        break
      default:
        widget = new TextBox(controls)
    }

    return widget
  }

  /** 转换下拉值 */
  transParam(pm: any[]): SelectOpt[] {
    if (!pm.length) {
      return []
    }

    const tmp = pm
      .filter(el => !el.isDeleted && el.state === 'ENABLE')
      .map(el => ({ id: el.paramValue, name: el.name, state: el.state }))

    return tmp
  }
}
