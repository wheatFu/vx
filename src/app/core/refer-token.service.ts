import { HttpBackend, HttpClient } from '@angular/common/http'
import { Inject, Injectable, OnDestroy } from '@angular/core'
import { environment } from '@env/environment'
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '@knz/auth'
import { interval, Observable, Subject, Subscription } from 'rxjs'
import { filter, map, share, tap } from 'rxjs/operators'

export interface HttpResponseBody<T> {
  data: T
  dataConfig?: unknown
  result: {
    code: number
    message: string
  }
}

export interface Tokens {
  token: string
  refreshToken: string
}
/**
 * token @knz/auth 自带, 不再重写
 * 本服务主要是refertoken相关
 */

@Injectable({
  providedIn: 'root',
})
export class ReferTokenService implements OnDestroy {
  private refresh$ = new Subject<ITokenModel>()
  private interval$: Subscription

  pureHttpClient: HttpClient // HTTP 客户端不走拦截器

  tokenExpiredTime = environment.api.tokenExpiredTime // token过期时间
  refreTokenExpiredTime = environment.api.refreTokenExpiredTime // refretoken过期时间

  constructor(httpBackend: HttpBackend, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    this.pureHttpClient = new HttpClient(httpBackend)
  }

  /** 获取refertoken */
  get refreshToken() {
    const tokensStr = localStorage.getItem('_token')
    if (!tokensStr) {
      return ''
    }
    const tokens: Tokens = JSON.parse(tokensStr)
    return tokens.refreshToken
  }

  /** token最后一次更新时间 */
  setTokensLastModified() {
    localStorage.setItem('tokensLastModified', String(new Date().getTime()))
  }

  /**
   * 取上次 tokens 刷新时间
   * 取不到就返回 -1
   */
  get tokensLastModified(): number {
    const time = localStorage.getItem('tokensLastModified')
    return time ? +time : -1
  }

  /** 清空 */
  clearTokensData(): void {
    this.tokenService.clear()
    localStorage.removeItem('_token')
    localStorage.removeItem('tokensLastModified')
    this.cleanRefresh()
  }

  /** 检查 token 是否过期 */
  isTokenExpired(): boolean {
    const tokensLastModified = this.tokensLastModified
    if (tokensLastModified === -1) return true

    return new Date().getTime() - tokensLastModified >= this.tokenExpiredTime
  }

  /** 检查 refreshToken 是否过期 */
  isRefreshTokenExpired(): boolean {
    const tokensLastModified = this.tokensLastModified
    if (tokensLastModified === -1) return true
    return new Date().getTime() - tokensLastModified >= this.refreTokenExpiredTime
  }

  /**
   * 使用 PureHttpClient 来请求新的 tokens
   * 不经过拦截器，用于在拦截中使用，防止进入循环依赖
   */
  getNewTokensPure(): Observable<Tokens> {
    const url = `${environment.SERVER_URL}/auth/refreshToken`
    const body = { refreshToken: this.refreshToken }
    return this.pureHttpClient.post(url, body).pipe(
      map((res: HttpResponseBody<Tokens>) => {
        if (!res.result || !res.data || res.result.code !== 0) {
          throw res
        }
        return res.data as Tokens
      }),
    )
  }

  /******************** 刷新token  region ********************/
  get refresh(): Observable<ITokenModel> {
    this.builderRefresh()
    return this.refresh$.pipe(share())
  }

  private builderRefresh(): void {
    this.cleanRefresh()
    this.interval$ = interval(this.tokenExpiredTime)
      .pipe(
        map(() => {
          const item = this.tokenService.get() as ITokenModel
          const expired = this.tokenExpiredTime || this.refreTokenExpiredTime || -1
          if (expired < 0) {
            return null
          }
          // if (!this.isTokenExpired()) {
          //   return null
          // }

          item.tokensLastModified = this.tokensLastModified

          return item
        }),
        filter(v => v != null),
      )
      .subscribe(res => this.refresh$.next(res!))
  }

  private cleanRefresh(): void {
    if (this.interval$ && !this.interval$.closed) {
      this.interval$.unsubscribe()
    }
  }

  /******************** 刷新token  regionend ********************/
  ngOnDestroy(): void {
    this.cleanRefresh()
  }
}
