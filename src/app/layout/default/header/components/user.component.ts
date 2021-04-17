import { Component, Inject, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd'
import { SettingsService, _HttpClient } from '@knz/theme'
import { DA_SERVICE_TOKEN, ITokenService } from '@knz/auth'

@Component({
  selector: 'header-user',
  template: `
    <div
      class="knz-default__nav-item d-flex align-items-center px-sm"
      nz-dropdown
      nzPlacement="bottomRight"
      [nzDropdownMenu]="userMenu"
    >
      <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
      {{ settings.user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          {{ 'app.login.logout' | translate }}
        </div>
      </div>
    </nz-dropdown-menu>
  `,
})
export class HeaderUserComponent {
  isVisible = false
  isOkLoading = false
  get oldpassword() {
    return this.form.controls.oldpassword
  }
  get password() {
    return this.form.controls.password
  }
  get confirm() {
    return this.form.controls.confirm
  }
  form: FormGroup
  error = ''
  type = 0
  visible = false
  status = 'pool'
  progress = 0
  passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception',
  }

  constructor(
    public http: _HttpClient,
    public settings: SettingsService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    fb: FormBuilder,
    public msg: NzMessageService,
  ) {
    this.form = fb.group({
      oldpassword: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(6), HeaderUserComponent.checkPassword.bind(this)]],
      confirm: [null, [Validators.required, Validators.minLength(6), HeaderUserComponent.passwordEquar]],
    })
  }

  static checkPassword(control: FormControl) {
    if (!control) return null
    const self: any = this
    self.visible = !!control.value
    if (control.value && control.value.length > 9) {
      self.status = 'ok'
    } else if (control.value && control.value.length > 5) {
      self.status = 'pass'
    } else {
      self.status = 'pool'
    }

    if (self.visible) {
      self.progress = control.value.length * 10 > 100 ? 100 : control.value.length * 10
    }
  }

  static passwordEquar(control: FormControl) {
    if (!control || !control.parent) {
      return null
    }
    if (control.value !== control.parent.get('password')!.value) {
      return { equar: true }
    }
    return null
  }

  showPwdModal(): void {
    this.isVisible = true
  }

  pwdHandleOk(): void {
    this.error = ''
    Object.keys(this.form.controls).forEach(key => {
      this.form.controls[key].markAsDirty()
      this.form.controls[key].updateValueAndValidity()
    })
    if (this.form.invalid) {
      return
    }
    this.isOkLoading = true
    const data = this.form.value
    this.visible = false
    this.http.post('/updatepwd', data).subscribe(() => {
      this.isVisible = false
      this.isOkLoading = false
    })
  }

  pwdHandleCancel(): void {
    this.isVisible = false
  }

  logout() {
    this.tokenService.clear()
    this.router.navigateByUrl(this.tokenService.login_url!)
  }
}
