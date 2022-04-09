import { MenuService, SettingsService, _HttpClient } from '@knz/theme'
import { Component, OnDestroy, Inject, Optional, OnInit, Injector } from '@angular/core'
import { Router } from '@angular/router'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import { SocialService, SocialOpenType, ITokenService, DA_SERVICE_TOKEN } from '@knz/auth'
import { ReuseTabService } from '@knz/assembly'
import { environment } from '@env/environment'
import { StartupService } from '@core'
import { map, mergeMap, tap, filter } from 'rxjs/operators'
import { AuthService } from '@core/auth.service'
import { ReferTokenService } from '@core/refer-token.service'
import { KnxNewTokenService } from 'knx-ngx/core'

@Component({
  selector: 'app-login',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.less'],
  providers: [SocialService],
})
export class LoginComponent implements OnInit, OnDestroy {
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
    private authService: AuthService,

    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    private knxNewTokenService: KnxNewTokenService,
    private refTokenSrv: ReferTokenService,
    public http: _HttpClient,
    public msg: NzMessageService,
    private injector: Injector,
  ) {
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, Validators.required],
      mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      captcha: [null, [Validators.required]],
      remember: [true],
    })
    modalSrv.closeAll()
    // 处理登录成功后，点击浏览器左上角返回操作时，又回退到登录页的问题
    const { token } = (this.injector.get(DA_SERVICE_TOKEN) as ITokenService).get()
    if (token) {
      this.router.navigateByUrl('/home')
    }
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

  ngOnInit(): void {
    this.refTokenSrv.clearTokensData()
  }

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
      .post('/auth/login', {
        loginName: 'vxcore',
        type: this.type,
        username: this.userName.value,
        password: this.password.value,
        productCode: 'PLATFORM',
      })
      .pipe
      // tap(res => {
      //   if (+res.result.code !== 0) {
      //     throw new Error(res.result.message || '登录失败')
      //   }
      // }),
      // map((res: any) => res.data!),
      // tap(res => {
      //   // this.tokenService.set(res)
      //   // this.refTokenSrv.setTokensLastModified()
      //   if (res.newToken) {
      //     this.knxNewTokenService.updateTokensData(res.newToken)
      //     const decryptToken = this.knxNewTokenService.getDecryptToken(res.newToken)
      //     this.knxNewTokenService.setTimer(decryptToken.expireDate)
      //   }
      // }),
      // mergeMap(() => this.getSelfInfo()),
      ()
      .subscribe(
        res => {
          if (res.result.code !== 0) {
            const { data } = res
            // 清空路由复用信息
            this.reuseTabService.clear()

            // const userInfo = data.isAdmin ? { name: data.name } : data.employee
            // this.settingsService.setUser(userInfo) // 简单用户信息{user: xxx}
            // this.authService.setUserInfo(data) // 中台common用户信息
            // this.authService.setSelectData(dataConfig) // 2021720中台取消全部数据字典接口

            let url = this.tokenService.referrer!.url || '/'
            if (url.includes('/passport')) {
              url = '/'
            }
            this.router.navigateByUrl(url)
          } else {
            this.msg.error(res.result.message)
          }
          // this.menuService.add(SIDEBAR_MENU_DATA.menu[0].children)
          // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
          // this.startupSrv.load().then(() => {})
        },
        err => {
          this.msg.error(err)
        },
      )
  }

  /**
   * 获取用户信息
   */
  getSelfInfo() {
    const url = '/organization/employee/getSelfInfoV2'
    return this.http.get(url)
  }

  // #endregion
  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$)
    }
  }
}
