import { MenuService, SettingsService, _HttpClient } from '@knz/theme'
import { Component, OnDestroy, Inject, Optional } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import { SocialService, SocialOpenType, ITokenService, DA_SERVICE_TOKEN } from '@knz/auth'
import { ReuseTabService } from '@knz/assembly'
import { environment } from '@env/environment'
import { StartupService } from '@core'

@Component({
  selector: 'app-login',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.less'],
  providers: [SocialService],
})
export class LoginComponent implements OnDestroy {
  constructor(
    fb: FormBuilder,
    modalSrv: NzModalService,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    private menuService: MenuService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    public msg: NzMessageService,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true],
    })
    modalSrv.closeAll()
  }

  // #region fields

  get userName() {
    return this.form.controls.userName
  }
  get password() {
    return this.form.controls.password
  }
  get mobile() {
    return this.form.controls.mobile
  }
  get captcha() {
    return this.form.controls.captcha
  }
  form: FormGroup
  error = ''
  type = 0

  // #region get captcha

  count = 0
  interval$: any

  // #endregion

  switch(ret: any) {
    this.type = ret.index
  }

  getCaptcha() {
    if (this.mobile.invalid) {
      this.mobile.markAsDirty({ onlySelf: true })
      this.mobile.updateValueAndValidity({ onlySelf: true })
      return
    }
    this.count = 59
    this.interval$ = setInterval(() => {
      this.count -= 1
      if (this.count <= 0) {
        clearInterval(this.interval$)
      }
    }, 1000)
  }

  // #endregion

  submit() {
    this.error = ''
    if (this.type === 0) {
      this.userName.markAsDirty()
      this.userName.updateValueAndValidity()
      this.password.markAsDirty()
      this.password.updateValueAndValidity()
      if (this.userName.invalid || this.password.invalid) {
        return
      }
    } else {
      this.mobile.markAsDirty()
      this.mobile.updateValueAndValidity()
      this.captcha.markAsDirty()
      this.captcha.updateValueAndValidity()
      if (this.mobile.invalid || this.captcha.invalid) {
        return
      }
    }

    this.http
      .post('/login/account?_allow_anonymous=true', {
        type: this.type,
        userName: this.userName.value,
        password: this.password.value,
      })
      .subscribe((res: any) => {
        if (res.msg !== 'ok') {
          this.error = res.msg
          return
        }
        // 清空路由复用信息
        this.reuseTabService.clear()
        // 设置用户Token信息
        this.tokenService.set(res.user)
        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        this.startupSrv.load().then(() => {
          this.menuService.add(res.menu)
          let url = this.tokenService.referrer!.url || '/'
          if (url.includes('/passport')) {
            url = '/'
          }
          this.router.navigateByUrl(url)
        })
      })
  }

  // #endregion

  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$)
    }
  }
}
