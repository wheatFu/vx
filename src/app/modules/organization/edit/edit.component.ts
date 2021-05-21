import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '@core/auth.service'
import { NzMessageService, NzTreeNode } from 'ng-zorro-antd'
import { Observable, Subscription } from 'rxjs'
import { switchMap, map, filter, tap } from 'rxjs/operators'
import { OperatList, TreeSourceOpts } from '../interfaces/organization.model'
import { OrganizationService } from '../service/organization.service'
import * as moment from 'moment'
import { _HttpClient } from '@knz/theme'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.less'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class EditComponent implements OnInit, OnDestroy {
  superiorId: string // 上级单元id
  validateForm!: FormGroup
  orgInfo: TreeSourceOpts
  operat: string // 操作类型 add 新增，edit编辑，change变更
  optTitle: string

  // 根组织
  orgRoot = false

  // modal
  isVisible = false
  selecetdNode: NzTreeNode

  // tree
  nodeOpts: TreeSourceOpts

  // router
  redirectUrl = '/organization/info'

  // form
  type: any // 组织类型
  status: any // 组织状态
  sydate = new Date()

  subscrip: Subscription
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private orgService: OrganizationService,
    private msg: NzMessageService,
    private authService: AuthService,
    public router: Router,
    public http: _HttpClient,
  ) {
    this.validateForm = this.fb.group({
      parentName: [null, Validators.required],
      code: [null, Validators.required],
      name: [null, Validators.required],
      hierarchy: [{ value: null, disabled: true }],
      type: [null, Validators.required],
      region: [null],
      status: [null, Validators.required],
      effectiveDate: [new Date()],
    })

    this.getOrgSelectOps('org_organization', 'type')
    this.getOrgSelectOps('org_organization', 'status')
  }

  ngOnInit() {
    this.subscrip = this.route.queryParams
      .pipe(
        tap(res => {
          const optTpye = res['type']
          this.operat = optTpye
          this.optTitle = OperatList[optTpye]
          this.setStatusVlid(optTpye)
        }),
        filter(res => !(res['type'] === 'add')),
        map((dat: { id: string }) => dat.id),
        switchMap(id => this.getInfo(id)),
      )
      .subscribe(res => {
        if (res.data && Object.keys(res.data).length) {
          const { data } = res

          if (data.isRoot) {
            this.orgRoot = true
            this.setRootVlid(data.isRoot)
          }
          this.fillInfo(data)
        }
      })
  }

  get username() {
    return this.authService.getUserInfo().name
  }

  /** 设置组织状态验证 */
  setStatusVlid = (value: string) => {
    const ctrl = this.validateForm.get('status')
    value === 'add' ? ctrl.setValidators([Validators.required]) : ctrl.clearValidators()
    ctrl.updateValueAndValidity()
  }

  /** 设置上级组织验证 */
  setRootVlid = (state: string) => {
    const ctrl = this.validateForm.get('parentName')
    state ? ctrl.setValidators([Validators.required]) : ctrl.clearValidators()
    ctrl.updateValueAndValidity()
  }

  /** 获取下拉 */
  getOrgSelectOps(key: string, col: string) {
    const config = this.authService.getSelectSole(key, col)
    const { configParamConfigValue: val } = config
    if (val.length) {
      this[col] = val
    }
  }

  /** 获取单个组织信息 */
  getInfo(id: string) {
    return this.orgService.getOrninfoById(id)
  }

  /** 填充单个编辑 */
  fillInfo(data: TreeSourceOpts) {
    this.orgInfo = data
    this.superiorId = data.superiorId || ''
    this.validateForm.patchValue({
      parentName: (data.superior && data.superior.name) || '-',
      code: data.code,
      name: data.name,
      hierarchy: data.hierarchy,
      type: data.type,
      region: data.region,
      status: data.status,
    })
  }

  /** 选择上级组织 */
  add() {
    this.isVisible = true

    const param =
      this.operat === 'add'
        ? {}
        : {
            organizationDimensionId: this.orgInfo.organizationDimensionId || '',
            organizationId: this.orgInfo.id || '',
          }
    this.getTreeDat(param).subscribe(res => {
      if (+res.result.code === 0) {
        const { data }: { data: TreeSourceOpts } = res
        if (!data || !data.id) return
        this.nodeOpts = data
      }
    })
  }

  clear() {
    this.validateForm.patchValue({ parentName: null })
    this.superiorId = ''
  }

  getCurrentNode(node: NzTreeNode) {
    this.selecetdNode = node
  }

  getTreeDat(param: any): Observable<any> {
    return this.orgService.getOrganizationTree(param)
  }

  handleCancel() {
    this.isVisible = false
  }

  handleOk() {
    if (!this.selecetdNode) {
      this.msg.warning('未选择任何组织')
    }

    this.superiorId = this.selecetdNode.key
    this.validateForm.patchValue({ parentName: this.selecetdNode.origin.title })
    this.isVisible = false
  }

  /** 保存 */
  saveOrg() {
    const baseForm = this.validateForm
    if (baseForm.invalid) {
      for (const i of Object.keys(baseForm.controls)) {
        baseForm.controls[i].markAsDirty()
        baseForm.controls[i].updateValueAndValidity()
      }
      return false
    }

    if (!this.orgRoot && !this.superiorId) {
      this.msg.warning('上级组织单元不能为空')
      return false
    }

    const startDate = baseForm.get('effectiveDate').value

    const formVal = baseForm.getRawValue()
    // 新增
    const pdata = {
      effectiveDate: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      superiorId: this.superiorId,
    }

    let params: any
    let requst$: Observable<any>

    if (this.operat === 'add') {
      params = { ...formVal, ...pdata, ...{ isInChangePlan: true, organizationDimensionId: 'DEFAULT_DIMENSION' } }
      requst$ = this.orgService.addOrganization(params)
    }

    if (this.operat === 'edit') {
      params = { ...this.orgInfo, ...formVal, ...pdata, isInChangePlan: false }
      requst$ = this.orgService.updateOrganization(params)
    }

    if (this.operat === 'change') {
      params = { ...this.orgInfo, ...formVal, ...pdata, isInChangePlan: true }
      requst$ = this.orgService.updateOrganization(params)
    }

    requst$.subscribe(res => {
      if (res.result.code === 0) {
        this.msg.success(`${this.optTitle}成功`)
        this.router.navigate([this.redirectUrl])
      } else {
        const msg = res.result.message || `${this.optTitle}失败`
        this.msg.error(msg)
      }
    })
  }

  doCancel() {
    this.router.navigate([this.redirectUrl])
  }

  ngOnDestroy() {
    if (this.subscrip) this.subscrip.unsubscribe()
  }
}
