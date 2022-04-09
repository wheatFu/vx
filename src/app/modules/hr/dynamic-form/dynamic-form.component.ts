import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms'
import { BaseControlService } from './base-control.service'
import { DynamicFormService } from './dynamic-form.service'
import { BaseControl } from './form-base'
import { SystemUtilsService } from 'knx-vui'
import { NzMessageService } from 'ng-zorro-antd'
import { filter, map, mergeMap, tap } from 'rxjs/operators'
import { HrService } from '../service/hr.service'
import { ValidFromService } from 'src/app/valid/valid-from.service'
import * as moment from 'moment'
import { EditUrlKey } from '../interfaces/hr.model'
import { Subscription } from 'rxjs'
import { HrEditService } from '../hr-edit/hr-edit.service'

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.less'],
  providers: [BaseControlService, DynamicFormService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  @HostBinding('style.width') width = '100%'

  @Input() dataConfig!: any // 员工表及字段数据配置信息
  @Input() isRelated!: boolean // 组织职位是否关联
  @Input() saveLoading: boolean
  @Input() urlKey: EditUrlKey

  /**
   * 操作类型
   * add 新增 entry 入职 edit 编辑 look查看
   */
  @Input() operat: 'add' | 'entry' | 'edit' | 'look'

  @Input() formDisabled: boolean

  @Output() save = new EventEmitter<any>()

  @Output() cancel = new EventEmitter<any>()

  baseForm: FormGroup
  private scp$: Subscription
  /** 用于存放系统控件name值 */
  localSysValue: {
    [key: string]: string
  } = {}

  controls: BaseControl<any>[]
  constructor(
    private baseSrv: BaseControlService,
    private dynamicSrv: DynamicFormService,
    private knxuiSrv: SystemUtilsService,
    public msg: NzMessageService,
    public hrSrv: HrService,
    public hrEdSrv: HrEditService,
    private validSrv: ValidFromService,
  ) {}

  ngOnInit() {
    this.buildForm()

    this.scp$ = this.baseForm.valueChanges
      .pipe(filter(() => ['org_employee', 'vx_employee_trial'].includes(this.urlKey)))
      .subscribe(res => {
        this.hrEdSrv.changeEmpBase('2', {
          [this.urlKey]: { form: this.baseForm, val: res, sys: this.localSysValue },
        })
      })

    if (this.baseForm.get('credentialType')) {
      this.baseForm.get('credentialType').valueChanges.subscribe(res => {
        const idNoCtr = this.getControlFromControlsByKey(this.controls, 'idNo')
        this.checkIDcard(res, this.baseForm.get('idNo'), idNoCtr.required)
      })
    }
  }

  /** 构建表单 */
  private buildForm(): void {
    const columns = !!this.dataConfig && this.dataConfig.columns ? this.dataConfig.columns : []
    const paramConfig = !!this.dataConfig && this.dataConfig.paramConfig ? this.dataConfig.paramConfig : []

    if (columns.length) {
      this.dynamicSrv.getTranColums(columns, paramConfig).subscribe(res => {
        this.controls = res
        this.baseForm = this.baseSrv.toFormGroup(this.formDisabled, res)

        if (['org_employee', 'vx_employee_trial'].includes(this.urlKey)) {
          const empBaseForm = this.hrEdSrv.empBaseForm[this.urlKey]
          const sys = (empBaseForm && empBaseForm.sys) || null
          this.localSysValue = { ...this.localSysValue, ...sys }
          if (empBaseForm && empBaseForm.val) {
            /** 特殊控件 */
            if ('organizationId' in empBaseForm.val) {
              empBaseForm.val['organizationId'] = this.localSysValue.organizationName
            }
            if ('positionId' in empBaseForm.val) {
              empBaseForm.val['positionId'] = this.localSysValue.positionName
            }
            if ('reportTo' in empBaseForm.val) {
              empBaseForm.val['reportTo'] = this.localSysValue.reportToName
            }

            this.baseForm.patchValue(empBaseForm.val)
          }
        }
      })
    }
  }

  /**
   * select选择事件
   * @param controlObj 控件对象
   * @param value 控件选中的当前值
   */
  onSelectChange(key: string, value: string) {
    const from = this.baseForm
    switch (key) {
      case 'status':
        {
          const leaveDateControl = this.baseForm.controls.hasOwnProperty('leaveDate')
            ? this.baseForm.get('leaveDate')
            : null

          if (!leaveDateControl) {
            return
          }
          if (value === 'INSERVICE') {
            // 员工状态为在职时隐藏离职日期(禁用)
            leaveDateControl.clearValidators()
            leaveDateControl.updateValueAndValidity()
            from.patchValue({ leaveDate: null })
          } else {
            leaveDateControl.setValidators([Validators.required])
            leaveDateControl.updateValueAndValidity()
          }
        }
        break
      case 'probationaryStatus': {
        const trial = this.hrEdSrv.empBaseForm

        if (!trial.vx_employee_trial) {
          this.hrEdSrv.changeEmpBase('2', {
            vx_employee_trial: { form: null, sys: null, val: { status: value } },
          })
          return
        }

        if (trial && trial.vx_employee_trial && trial.vx_employee_trial.val) {
          trial.vx_employee_trial.val = { ...trial.vx_employee_trial.val, status: value }
        } else {
          trial.vx_employee_trial['val'] = { status: value }
        }

        this.hrEdSrv.changeEmpBase('2', trial)

        break
      }
    }
  }

  /** 动态验证 */
  checkIDcard(zjlx: string, validctrl: AbstractControl, required: boolean): void {
    const idcarRule: ValidatorFn[] = required
      ? [Validators.required, this.validSrv.idcardValid()]
      : [this.validSrv.idcardValid()]
    const otherRule: ValidatorFn[] = required ? [Validators.required] : null
    zjlx === 'ID_CARD' ? validctrl.setValidators(idcarRule) : validctrl.setValidators(otherRule)

    validctrl.updateValueAndValidity()
  }

  get status() {
    return this.baseForm.get('status')
  }

  /**
   * 监听输入
   */
  onInput(inputKey: string): void {
    /**
     * 当输入的是证件号，选择的证件类型是“身份证”，且“性别”或者“生日”未填写时，根据身份证号自动填写
     * credentialType - 'ID_CARD'
     * gender - 'MAN' / 'WOMAN'
     * birth - Date
     */

    const inputValue = this.baseForm.get(inputKey).value
    if (inputKey === 'idNo') {
      if (!/^\d{17}(\d|x|X)$/.test(inputValue)) {
        return
      }

      const gender = this.getControlFromControlsByKey(this.controls, 'gender')
      const birth = this.getControlFromControlsByKey(this.controls, 'birth')

      const credentialType = this.baseForm.get('credentialType')

      if (credentialType && credentialType.value === 'ID_CARD') {
        if (gender && !gender.value) {
          const value = Number(inputValue.substr(16, 1)) % 2 === 1 ? 'MAN' : 'WOMAN'
          this.baseForm.patchValue({ gender: value })
        }
        if (birth && !birth.value) {
          const year = inputValue.substr(6, 4)
          const month = inputValue.substr(10, 2)
          const day = inputValue.substr(12, 2)
          const value = new Date(`${year}-${month}-${day}`)
          this.baseForm.patchValue({ birth: value })
        }
      }
    }
  }

  private getControlFromControlsByKey<T>(controls: BaseControl<T>[], key: string): BaseControl<T> | null {
    for (const control of controls) {
      if (control.key === key) {
        return control
      }
    }
    return null
  }

  /** 选择系统控件 */
  addSysCtrls(type: string, key: any): void {
    if (!type) {
      this.msg.error(`未获取到systemControl`)
      return
    }

    if (!key || !this.baseForm.controls.hasOwnProperty(key)) {
      this.msg.error(`缺少formControlName`)
      return
    }

    const dimId = 'DEFAULT_DIMENSION'

    switch (type) {
      case 'DEPARTMENT_CHOICE_SINGLE':
        this.knxuiSrv
          .showOrgDialog({
            defaultCurrent: false,
            multiple: false,
            showCheckSon: false,
            title: '部门选择',
            urlPrefix: `/`,
            organizationDimensionId: dimId,
            orgId: '',
            isDisplayDimension: false,
          })
          .subscribe((data: any[]) => {
            if (data.length) {
              this.localSysValue['organizationId'] = data[0].id
              this.localSysValue['organizationName'] = data[0].name
              this.baseForm.patchValue({ [key]: data[0].title || null })
            }
          })
        break

      case 'JOB_CHOICE_SINGLE':
        this.knxuiSrv
          .showScPositionDialog({
            positionId: '0',
            isMulti: false,
            urlPrefix: '/',
            organizationDimensionId: dimId,
            isDisplayDimension: false,
          })
          .pipe(
            filter((res: Array<{ id: string; name: string; organizationId: string }>) => !!(res && res.length)),
            tap(res => {
              this.localSysValue['positionId'] = res[0].id
              this.localSysValue['positionName'] = res[0].name
              this.baseForm.patchValue({ [key]: res[0].name })
            }),
            map(res => res[0].organizationId),
            filter(id => this.isRelated && !!id),
            mergeMap(id => this.hrSrv.getOrgById(id)),
          )
          .subscribe((res: any) => {
            if (res.result.code === 0 && res.data && res.data.name) {
              this.localSysValue['organizationId'] = res.data.id
              this.localSysValue['organizationName'] = res.data.name
              this.baseForm.patchValue({ organizationId: res.data.name })
            }
          })
        break

      case 'PERSONNEL_SELECTION_SINGLE':
        this.knxuiSrv
          .showScEmployeeDialog(false, {
            checkedData: [],
            urlPrefix: `/`,
            employeeId: '',
          })
          .subscribe((data: any) => {
            if (data.name) {
              this.localSysValue['reportTo'] = data.id
              this.localSysValue['reportToName'] = data.name
              this.baseForm.patchValue({ [key]: data.name })
            }
          })
        break
    }
  }

  /** 清除控件 */
  clearSysCtrls(type: string, key: string) {
    const form = this.baseForm

    switch (type) {
      case 'DEPARTMENT_CHOICE_SINGLE':
        {
          this.localSysValue['organizationId'] = ''
          this.localSysValue['organizationName'] = ''
        }
        break

      case 'JOB_CHOICE_SINGLE':
        {
          this.localSysValue['positionId'] = ''
          this.localSysValue['positionName'] = ''

          if (this.isRelated) {
            form.patchValue({ organizationId: null })
            this.localSysValue['organizationId'] = ''
            this.localSysValue['organizationName'] = ''
          }
        }
        break
      case 'PERSONNEL_SELECTION_SINGLE':
        {
          this.localSysValue['reportTo'] = ''
          this.localSysValue['reportToName'] = ''
        }
        break
    }

    // 先清除本地再清控件
    if (form.controls.hasOwnProperty(key)) {
      form.patchValue({ [key]: null })
    }
  }

  /** 格式日期 */
  formatDate(ct: string, value: Date): string {
    switch (ct) {
      case 'date_time':
        return moment(value).format('HH:mm:ss')
      case 'date_datetime':
        return moment(value).format('YYYY-MM-DD HH:mm:ss')
      case 'date_ymd':
        return moment(value).format('YYYY-MM-DD')
      case 'date_ym':
        return moment(value).format('YYYY-MM')
      case 'date_y':
        return moment(value).format('YYYY')
      default:
        return moment(value).format('YYYY-MM-DD')
    }
  }

  /**
   * save 保存 只验证姓名
   * sumbit 完全验证
   */
  onSubmit(type: string): void {
    const form = this.baseForm

    if (form.invalid && type === 'submit') {
      // tslint:disable-next-line:forin
      for (const i in form.controls) {
        form.controls[i].markAsDirty()
        form.controls[i].updateValueAndValidity()
      }
      return
    }

    const newModel: any = {}
    const tmpModel = form.value
    Object.keys(tmpModel).map(key => {
      const controlType = this.getControlFromControlsByKey(this.controls, key).controlType

      if (tmpModel[key] instanceof Date) {
        newModel[key] = this.formatDate(controlType, tmpModel[key])
      }
    })

    this.save.emit({ type, formValue: { ...tmpModel, ...newModel, ...this.localSysValue } })
  }

  /** 取消 */
  onCancel() {
    this.cancel.emit('')
  }

  ngOnDestroy(): void {
    if (this.scp$) {
      this.scp$.unsubscribe()
    }
  }
}
