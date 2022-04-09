import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '@core/auth.service'
import { NzMessageService } from 'ng-zorro-antd'
import { HrService } from '../service/hr.service'
import { _HttpClient } from '@knz/theme'
import { filter, map, mergeMap, tap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { environment } from '@env/environment'
import { GENDER_MAP_DEFAULT_AVATAR, EmployeeData } from '../interfaces/hr.model'
import { SystemUtilsService } from 'knx-vui'
import { parseQueryParam } from '../../../utils/utils'
import * as moment from 'moment'
function handleOperation(url) {
  // @ts-ignore
  const _query_params_map_obj = parseQueryParam(...arguments)
  const OPERATION_MAP_CHINESE = {
    regular: '转正',
    transfer: '调动',
    resign: '离职',
  }
  if (_query_params_map_obj.operate === 'transfer') {
    this.judgeIsRelated()
  }
  this.getEmployeeDetail(_query_params_map_obj.id)
  this.operation = OPERATION_MAP_CHINESE[_query_params_map_obj.operate]
  this.operationType = _query_params_map_obj.operate
}
const _selected_position_info = {
  organizationId: '',
  id: '', // 职位id
}
let _report_to_info = {
  id: '',
}
@Component({
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.less'],
})
export class OperationComponent implements OnInit, OnDestroy {
  validateForm!: FormGroup
  operation: string
  operationType: string
  resignTypes: Array<{ label: string; value: string }> = []
  regularTypes: Array<{ label: string; value: string }> = []
  employInfo: EmployeeData
  isRelated: boolean
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private hrService: HrService,
    private msg: NzMessageService,
    private authService: AuthService,
    private router: Router,
    public http: _HttpClient,
    private knxUiService: SystemUtilsService,
  ) {
    const operate_map = parseQueryParam(window.location.href)
    this.validateForm = this.fb.group({
      regularComments: [null],
      regularType: [null, operate_map.operate === 'regular' ? Validators.required : null],
      regularDate: [new Date()],
      resignType: [null, operate_map.operate === 'resign' ? Validators.required : null],
      resignReason: [null],
      resignDate: [new Date()],
      organizationName: [null, operate_map.operate === 'transfer' ? Validators.required : null], // 调动后部门
      positionName: [null, operate_map.operate === 'transfer' ? Validators.required : null], // 调动后职位
      reportToName: [null, operate_map.operate === 'transfer' ? Validators.required : null], // 调动后汇报人
    })
  }
  ngOnInit() {
    handleOperation.call(this, window.location.href)
  }
  judgeIsRelated() {
    this.hrService.getisRelated().subscribe(isRelated => {
      this.isRelated = !!isRelated
    })
  }
  getEmployeeDetail(id) {
    this.hrService.getEmployeeInfo(...arguments).subscribe(resp => {
      const { result, data } = resp
      if (+result.code === 0) {
        this.employInfo = {
          ...data,
          profile: data.profile
            ? `${environment.SERVER_URL}/file/www/${data.profile}`
            : GENDER_MAP_DEFAULT_AVATAR[data.gender],
        }
      } else {
        this.msg.warning(result.message)
      }
    })
  }
  handleGetTypes(operationType: string): Observable<Array<{ label: string; value: string }>> {
    const operation_map_type = {
      '1': this.hrService.getRegularTypeList(),
      '2': this.hrService.getResignTypeList(),
    }
    return operation_map_type[operationType].pipe(
      map((resp: { result: any; data: any }) => {
        const { result, data } = resp
        if (+result.code === 0) {
          return Object.keys(data).reduce((prev, key) => {
            prev.push.call(prev, { label: data[key], value: key })
            return prev
          }, [])
        }
        this.msg.warning(result.message)
        return []
      }),
    )
  }
  getOffServiceTypes() {
    if (this.resignTypes.length) return
    this.handleGetTypes('2').subscribe(resp => {
      this.resignTypes = resp
    })
  }
  getRegularTypes() {
    if (this.regularTypes.length) return
    this.handleGetTypes('1').subscribe(resp => {
      this.regularTypes = resp
    })
  }
  /** 保存 */
  save() {
    const _query_params_map_obj = parseQueryParam(window.location.href)
    const { validateForm, employInfo } = this
    if (validateForm.invalid) {
      for (const i of Object.keys(validateForm.controls)) {
        validateForm.controls[i].markAsDirty()
        validateForm.controls[i].updateValueAndValidity()
      }
      return
    }
    const val = validateForm.getRawValue()
    const _OPERATION_MAP_SAVE_REQ = {
      regular: {
        req: this.hrService.saveToBecomeRegular,
        params: {
          employeeId: employInfo.id,
          regularComments: val.regularComments,
          regularDate: moment(val.regularDate).format('YYYY-MM-DD'),
          regularType: val.regularType,
        },
      },
      transfer: {
        req: this.hrService.saveToTransfer,
        params: {
          employeeId: employInfo.id,
          transferContent: {
            organizationId: _selected_position_info.organizationId, // 调动后部门id
            positionId: _selected_position_info.id, // 调动后职位id
            reportTo: _report_to_info.id, // 调动后汇报人id
            old_organizationId: employInfo.organizationId, // 调动前部门id
            old_positionId: employInfo.positionId, // 调动前职位id
            old_reportTo: employInfo.reportTo, // 调动前汇报人id
            organizationName: val.organizationName, // 调动后部门
            positionName: val.positionName, // 调动后职位
            reportToName: val.reportToName, // 调动后汇报人
            old_organizationName: employInfo.organizationName, // 调动前部门
            old_positionName: employInfo.positionName, // 调动前职位
            old_reportToName: employInfo.reportToName, // 调动前汇报人
          },
          transferDate: moment(new Date()).format('YYYY-MM-DD'),
        },
      },
      resign: {
        req: this.hrService.saveToResign,
        params: {
          employeeId: employInfo.id,
          resignReason: val.resignReason,
          resignDate: moment(val.resignDate).format('YYYY-MM-DD'),
          resignType: val.resignType,
        },
      },
    }
    const REQUEST = _OPERATION_MAP_SAVE_REQ[_query_params_map_obj.operate]
    REQUEST.req.call(this, REQUEST.params).subscribe(resp => {
      const { result } = resp
      if (+result.code === 0) {
        this.doCancel()
      } else {
        this.msg.warning(result.message)
      }
    })
  }

  doCancel() {
    this.router.navigate(['/hr/inservice'])
  }
  addPosition() {
    this.knxUiService
      .showScPositionDialog({
        positionId: '0',
        isMulti: false,
        urlPrefix: '/',
        organizationDimensionId: 'DEFAULT_DIMENSION',
        isDisplayDimension: false,
        excludePositionIds: [this.employInfo.positionId],
      })
      .pipe(
        tap(res => {
          const _selected = res[0] || {}
          // _selected_position_info = {..._selected,...{organizationId:_selected_position_info.organizationId}}
          Object.assign(_selected_position_info, _selected, {
            organizationId: _selected_position_info.organizationId || _selected.organizationId,
          })
          this.validateForm.patchValue({ positionName: res[0].name })
        }),
        map(res => res[0].organizationId),
        filter(organizationId => this.isRelated && !!organizationId),
        mergeMap(organizationId => this.hrService.getOrgById(organizationId)),
      )
      .subscribe(resp => {
        const { data, result } = resp
        if (+result.code === 0) {
          this.validateForm.patchValue({ organizationName: data.name })
        }
      })
  }
  clearPosition() {
    const { validateForm, isRelated } = this
    if (isRelated) {
      validateForm.patchValue({ organizationName: null })
    }
    validateForm.patchValue({ positionName: null })
  }
  addOrganization() {
    this.knxUiService
      .showOrgDialog({
        defaultCurrent: false,
        multiple: false,
        showCheckSon: false,
        title: '部门选择',
        urlPrefix: `/`,
        organizationDimensionId: 'DEFAULT_DIMENSION',
        disabledOrgIds: [this.employInfo.organizationId],
        isDisplayDimension: false,
      })
      .subscribe((data: any[]) => {
        if (data.length) {
          Object.assign(_selected_position_info, { organizationId: data[0].key })
          this.validateForm.patchValue({ organizationName: data[0].title })
        }
      })
  }
  clearOrganization() {
    this.validateForm.patchValue({ organizationName: null })
  }
  addReportTo() {
    this.knxUiService
      .showScEmployeeDialog(false, {
        checkedData: [],
        urlPrefix: `/`,
        excludeEmpIds: [this.employInfo.id],
      })
      .subscribe((data: any) => {
        _report_to_info = data
        this.validateForm.patchValue({ reportToName: data.name })
      })
  }
  clearReportTo() {
    const { validateForm } = this
    validateForm.patchValue({ reportToName: null })
  }

  ngOnDestroy() {}
}
