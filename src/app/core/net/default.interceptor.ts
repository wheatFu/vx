import { Injectable, Injector } from '@angular/core'
import { Router } from '@angular/router'
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
  HttpResponseBase,
  HttpResponse,
} from '@angular/common/http'
import { Observable, of, throwError, BehaviorSubject } from 'rxjs'
import { mergeMap, catchError, filter, switchMap, take } from 'rxjs/operators'
import { NzMessageService, NzModalService } from 'ng-zorro-antd'
import { _HttpClient } from '@knz/theme'
import { environment } from '@env/environment'
import { DA_SERVICE_TOKEN, ITokenService } from '@knz/auth'
import { I18NService } from '../i18n/i18n.service'
import { Tokens, ReferTokenService } from '@core/refer-token.service'

const CODEMESSAGE = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
}

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable({
  providedIn: 'root',
})
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenEnabled = environment.api.refreshTokenEnabled
  private refreshTokenType: 're-request' | 'auth-refresh' = environment.api.refreshTokenType
  private refreshToking = false
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null)

  constructor(
    private injector: Injector,
    private refertokenSrv: ReferTokenService,
    public i18NService: I18NService,
    public modalService: NzModalService,
  ) {
    if (this.refreshTokenType === 'auth-refresh') {
      this.buildAuthRefresh()
    }
  }

  get msg(): NzMessageService {
    return this.injector.get(NzMessageService)
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN)
  }

  private goTo(url: string) {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url))
  }

  private refreshTokenRequest(): Observable<Tokens> {
    return this.refertokenSrv.getNewTokensPure()
  }

  // #region 刷新Token方式一：使用 401 重新刷新 Token
  private tryRefreshToken(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 1、若请求为刷新Token请求，表示来自刷新Token可以直接跳转登录页
    const referTokenUrl = `${environment.SERVER_URL}/auth/refreshToken`
    if ([referTokenUrl].some(url => req.url.includes(url))) {
      console.log('刷新token返回401+14')
      this.goTo('/auth/login')
      return throwError(ev)
    }
    // 2、如果 `refreshToking` 为 `true` 表示已经在请求刷新 Token 中，后续所有请求转入等待状态，直至结果返回后再重新发起请求
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter(v => !!v),
        take(1),
        switchMap(() => next.handle(this.reAttachToken(req))),
      )
    }
    // 3、尝试调用刷新 Token
    this.refreshToking = true
    this.refreshToken$.next(null)

    return this.refreshTokenRequest().pipe(
      switchMap(res => {
        // 通知后续请求继续执行
        this.refreshToking = false
        this.refreshToken$.next(res)
        // 重新保存新 token
        this.tokenSrv.set(res)
        // 重新发起请求
        return next.handle(this.reAttachToken(req))
      }),
      catchError(err => {
        this.refreshToking = false
        this.goTo('/auth/login')
        return throwError(err)
      }),
    )
  }

  /**
   * 重新附加新 Token 信息
   *
   * > 由于已经发起的请求，不会再走一遍 `@knz/auth` 因此需要结合业务情况重新附加新的 Token
   */
  private reAttachToken(req: HttpRequest<any>): HttpRequest<any> {
    // 使用 `SimpleInterceptor`
    const token = this.tokenSrv.get().token || ''
    return req.clone({
      setHeaders: {
        Authorization: token,
      },
    })
  }
  // #endregion

  // #region 刷新Token方式二：使用
  private buildAuthRefresh(): void {
    if (!this.refreshTokenEnabled) {
      return
    }
    if (this.refertokenSrv.isRefreshTokenExpired()) {
      this.goTo('/auth/login')
      return
    }

    this.refertokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(() => {
          this.refreshToking = true
          return this.refreshTokenRequest()
        }),
      )
      .subscribe(
        res => {
          this.refertokenSrv.setTokensLastModified()
          this.refreshToking = false
          this.tokenSrv.set(res)
        },
        () => this.goTo('/auth/login'),
      )
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
    if (ev.status > 0) {
      this.injector.get(_HttpClient).end()
    }
    // 业务处理：一些通用操作
    // { result: { message: '', code: '' }, data: {} }
    switch (ev.status) {
      case 200:
        if (ev instanceof HttpResponse) {
          return of(ev)
        }
        break
      case 401:
        /**
         * code = 14 token过期，可做自动刷新tokens之后在重新请求
         * code = 17 refertoken 过期
         */

        // @ts-ignore
        const code = ev.error && ev.error.result.code && ev.error.result.code
        if (code === 14 && this.refreshTokenEnabled && this.refreshTokenType === 're-request') {
          return this.tryRefreshToken(ev, req, next)
        }

        this.modalService.closeAll()
        this.refertokenSrv.clearTokensData()
        this.msg.error(`未登录或登录已过期，请重新登录。`)
        this.goTo('/auth/login')
        break
      case 403:
      case 404:
      case 500:
        // this.goTo(`/exception/${ev.status}`);
        const errortext = CODEMESSAGE[ev.status] || ev.statusText
        this.msg.error(`${ev.status},${errortext}`)
        break
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn('未可知错误，大部分是由于后端不支持CORS或无效配置引起', ev)
        }
        break
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev)
    } else {
      return of(ev)
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url

    if (!url.startsWith('https://') && !url.startsWith('http://') && url.indexOf('assets') < 0) {
      url = environment.SERVER_URL + url
    }

    // 本地json文件去缓存
    if (url.indexOf('.json') >= 0) {
      url = url + '?t=' + Math.random()
    }

    const headers = {}
    const token = this.tokenSrv.get().token || ''
    if (token) {
      headers['Authorization'] = token
    }

    const newReq = req.clone({
      url,
      setHeaders: headers,
    })
    return next.handle(newReq).pipe(
      mergeMap((event: unknown) => {
        // 允许统一对请求错误处理
        if (event instanceof HttpResponseBase && event.status === 200) {
          return this.handleData(event, newReq, next)
        }
        // 若一切都正常，则后续操作
        return of(event)
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next)),
    )
  }
}
