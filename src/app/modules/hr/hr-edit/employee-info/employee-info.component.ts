import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NzMessageService, UploadFile, UploadXHRArgs } from 'ng-zorro-antd'
import { forkJoin, iif, Observable, Observer, of } from 'rxjs'
import { concatMap, filter, map, mergeMap, tap } from 'rxjs/operators'
import { EditUrlKey } from '../../interfaces/hr.model'
import { HrService } from '../../service/hr.service'
import { HrEditService } from '../hr-edit.service'

@Component({
  selector: 'app-employee-info',
  templateUrl: './employee-info.component.html',
  styleUrls: ['./employee-info.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeInfoComponent implements OnInit {
  formData = new FormData() // 头像文件数据
  uploading = false
  loading = false
  saveLoading = false
  redirectUrl: string
  dataConfig: any
  isRelated = false
  avatarUrl: string
  avatarId: string

  /**
   * 操作类型
   * add 新增 edit 编辑 look查看
   */
  operat: string

  /**
   * 编辑员工id
   * 新增为''
   */
  editId: string

  /**
   * 只有查看和编辑才有
   * 区分在职与离职的查看和编辑
   * resign 离职 inser 在职
   */
  source: string

  formDisabled: boolean

  constructor(
    private nzMsg: NzMessageService,
    private hrSrv: HrService,
    public router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private hrEidtSrv: HrEditService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.initForm()

    this.initAvatar()
  }

  get urlKey(): EditUrlKey {
    const url = this.router.url
    const urlKey = url.includes('?')
      ? this.router.url.substring(this.router.url.lastIndexOf('/') + 1, this.router.url.lastIndexOf('?'))
      : this.router.url.substr(this.router.url.lastIndexOf('/') + 1)

    return urlKey as EditUrlKey
  }

  /** 初始化头像 */
  initAvatar(): void {
    if (this.urlKey !== 'org_employee') {
      return
    }

    const avatar = this.hrEidtSrv.avatar
    this.avatarId = avatar.avatarId
    this.avatarUrl = avatar.avatarUrl
  }

  /**
   * customReq 上传
   * param item
   */
  customRequst = (item: UploadXHRArgs) => {
    const formData = new FormData()
    const { type } = item.file
    const suffix = type.substring(type.lastIndexOf('/') + 1)
    formData.append('effectiveFileTypes', [`.${suffix}`] as any)
    formData.append('isPublic', true as any)
    formData.append('file', item.file as any)
    formData.append('businessType', 'DEFAULT')
    this.formData = formData
    this.uploading = true
    const url = '/file/uploadWithBusinessType'
    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      withCredentials: true,
    })

    return this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total > 0) {
            // tslint:disable-next-line:no-any
            ;(event as any).percent = (event.loaded / event.total) * 100
          }
          item.onProgress(event, item.file)
        } else if (event instanceof HttpResponse) {
          // 处理成功
          this.uploading = false
          item.onSuccess(event.body, item.file, event)
        }
      },
      err => {
        // 处理失败
        this.uploading = false
        item.onError(err, item.file)
      },
    )
  }

  handleChange(info: { file: UploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.avatarUrl = null
        break
      case 'done':
        const { code, message, data } = info.file.response
        if (code) {
          this.nzMsg.error(message || '头像上传失败')
          this.avatarId = null
          return
        }

        // this.nzMsg.success('头像上传成功')
        this.avatarId = data && data.id

        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.avatarUrl = img
          this.hrEidtSrv.changeAvatar({ avatarId: this.avatarId, avatarUrl: this.avatarUrl })
          this.cdr.detectChanges()
        })

        break
      case 'error':
        this.avatarId = null
        this.nzMsg.error('Network error')
        break
    }
  }
  /**
   * beforeUpload 校验上传的图片格式
   * @param 'file'
   */
  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      const _support_file_type = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']
      const isJPG = _support_file_type.includes(file.type)
      if (!isJPG) {
        this.nzMsg.error('文件类型不合法,只能是jpg、gif、bmp、png、jpeg、png类型！')
        observer.complete()
        return
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.nzMsg.error('图片应小于2MB!')
        observer.complete()
        return
      }

      observer.next(isJPG && isLt2M)
      observer.complete()
    })
  }

  /**
   * getBase64 获取图片base64
   * param img
   * param callback
   */
  private getBase64(img: Blob, callback: (img: string) => void): void {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result!.toString()))
    reader.readAsDataURL(img)
  }

  /**
   * downLoadImg 根据文件id下载文件
   */
  downLoadImg(id: string) {
    this.hrSrv.getEmpAvatarImg(id).subscribe(
      res => {
        const blob = new Blob([res])
        const file = new File([blob], 'avatar', { type: 'image/jpeg' })
        this.getBase64(file, img => {
          this.avatarUrl = img
          this.cdr.detectChanges()
        })
      },
      error => {
        console.log(error)
      },
    )
  }

  /**
   * 获取自定义表单数据
   * 新增和编辑查看
   */
  initForm() {
    this.loading = true

    const tableName = this.urlKey
    const pdata = { tableName, columName: '' }

    const add$ = forkJoin(this.hrEidtSrv.isRelated, this.hrEidtSrv.personData, this.hrEidtSrv.getParamConfig(pdata))
    this.route.queryParams
      .pipe(
        filter(rt => !!(rt.type || (rt.type !== 'add' && rt.id))),
        tap(rt => {
          this.operat = rt['type']
          this.editId = rt['id'] || ''
          this.source = rt['source']
          this.redirectUrl = this.source ? (this.source === 'inser' ? '/hr/inservice' : '/hr/dismiss') : '/hr/entry'
        }),
        tap(rt => {
          this.formDisabled = rt['type'] === 'look' || (rt['type'] === 'edit' && this.urlKey === 'vx_employee_trial')
        }),
        mergeMap(rt =>
          iif(
            () => rt.type === 'add',
            add$,
            this.getEditData(rt.id).pipe(
              tap(res => {
                this.dealWithEditData(res)
              }),
              concatMap(() => add$),
            ),
          ),
        ),
      )
      .subscribe(
        res => {
          this.loading = false
          if (!res || !res.length) {
            return
          }

          this.dealWithAddData(res)
        },
        () => {
          this.loading = false
        },
      )
  }

  /** 处理新增订阅 */
  dealWithAddData(res: Array<any>): void {
    const [relat, pd, pm] = res
    this.isRelated = relat

    const tmp = { columns: pd[this.urlKey].columns }

    const { result, data } = pm
    tmp['paramConfig'] = !result.code && data && data.length ? data : []
    this.dataConfig = tmp
    this.cdr.detectChanges()
  }

  /** 处理修改订阅 */
  dealWithEditData(res: Array<any>): void {
    const [base, trial] = res
    this.cdr.detectChanges()

    const prpfileId = base.data.employeeInfo.profile
    if (prpfileId) {
      this.avatarId = prpfileId
      this.downLoadImg(prpfileId)
    }

    const tmp = {
      org_employee: { form: null, val: null, sys: null },
      vx_employee_trial: { form: null, val: null, sys: null },
    }
    if (base && base.data) {
      const bdat = base.data.employeeInfo
      tmp['org_employee']['val'] = bdat
      const sys = {
        organizationId: bdat.organizationId,
        organizationName: bdat.organizationName,
        positionId: bdat.positionId,
        positionName: bdat.positionName,
        reportTo: bdat.reportTo,
        reportToName: bdat.reportToName,
      }
      tmp['org_employee']['sys'] = sys
    }
    if (trial && trial.data) {
      tmp['vx_employee_trial']['val'] = trial.data
    }

    this.hrEidtSrv.changeEmpBase('1', tmp)
  }

  /** 获取编辑数据 */
  getEditData(id: string): Observable<any> {
    const entry$ = forkJoin(this.hrSrv.getEmpBaseById(id), this.hrSrv.getPreTrialById(id))

    const edit$ = forkJoin(
      this.hrSrv.getEmpRegularById(id).pipe(
        map(res => {
          const data = { data: { employeeInfo: { ...res.data } } }
          return data
        }),
      ),
      this.hrSrv.getEmpTrialById(id),
    )

    return this.operat === 'entry' ? entry$ : edit$
  }

  /** 保存 */
  doSubmit(ev: { type: 'save' | 'submit'; formValue: any }) {
    let save$: Observable<any>

    switch (this.urlKey) {
      case 'org_employee':
        {
          if (!ev.formValue.name) {
            this.nzMsg.warning('[员工信息]姓名不能为空')
            return
          }

          const form = this.hrEidtSrv.empBaseForm
          if (ev.type === 'submit' && (!form.vx_employee_trial || !form.vx_employee_trial.val)) {
            this.nzMsg.warning('请检查试用期信息')
            return
          }

          const employeeInfo = ev.formValue
          const trial = (form.vx_employee_trial && form.vx_employee_trial.val) || null
          const sysValue = (form.vx_employee_trial && form.vx_employee_trial.sys) || null

          const pdata = {
            baseInfo: { employeeInfo: { ...employeeInfo, profile: this.avatarId }, id: this.editId },
            trialInfo: { ...trial, ...sysValue, id: this.editId },
          }

          const updata = {
            ...employeeInfo,
            id: this.editId,
            profile: this.avatarId,
          }
          save$ =
            ev.type === 'submit'
              ? this.hrSrv.createEmployee(pdata)
              : this.operat === 'edit'
              ? this.hrSrv.updateEmployee(updata)
              : this.hrSrv.saveEmployee(pdata)
        }

        break

      case 'vx_employee_trial':
        {
          const form = this.hrEidtSrv.empBaseForm
          if (!form.org_employee || !form.org_employee || !form.org_employee.val || !form.org_employee.val.name) {
            this.nzMsg.warning('[员工信息]姓名不能为空')
            return
          }

          if (ev.type === 'submit' && (!form.org_employee || !form.org_employee.val)) {
            this.nzMsg.warning('请检查员工信息')
            return
          }

          const trial = ev.formValue
          const employeeInfo = (form.org_employee && form.org_employee.val) || null
          const sysValue = (form.org_employee && form.org_employee.sys) || null

          const pdata = {
            baseInfo: { employeeInfo: { ...employeeInfo, ...sysValue, profile: this.avatarId }, id: this.editId },
            trialInfo: { ...trial, id: this.editId },
          }
          save$ = ev.type === 'submit' ? this.hrSrv.createEmployee(pdata) : this.hrSrv.saveEmployee(pdata)
        }
        break
    }

    this.saveLoading = true

    save$.subscribe(res => {
      this.saveLoading = false
      this.cdr.detectChanges()

      const { message, code } = res.result
      if (code) {
        this.nzMsg.error(message || '操作失败')
        return
      }

      this.hrEidtSrv.clearEmpBase()
      this.router.navigate([this.redirectUrl])
    })
  }

  doCancel(ev) {
    this.hrEidtSrv.clearEmpBase()
    this.router.navigate([this.redirectUrl])
  }
}
