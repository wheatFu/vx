import { Injectable, Inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { zip } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { MenuService, SettingsService, TitleService, KNZ_I18N_TOKEN } from '@knz/theme'
import { RoleService } from '@knz/role'
import { TranslateService } from '@ngx-translate/core'
import { I18NService } from '../i18n/i18n.service'

import { NzIconService } from 'ng-zorro-antd'
import { ICONS_AUTO } from '../../../style-icons-auto'
import { ICONS } from '../../../style-icons'

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private translate: TranslateService,
    @Inject(KNZ_I18N_TOKEN) private i18n: I18NService,
    private settingService: SettingsService,
    private roleService: RoleService,
    private titleService: TitleService,
    private httpClient: HttpClient,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS)
    localStorage.setItem('browserType', this.returnBrowserType())
  }

  returnBrowserType(): string {
    const ua = navigator.userAgent
    if (/firefox/i.test(ua)) {
      return 'firefox'
    } else if (/chrome/i.test(ua)) {
      return 'chrome'
    } else if (/msie/i.test(ua)) {
      return 'ie'
    } else if ('ActiveXObject' in window) {
      return 'ie11'
    }
  }

  load(): Promise<any> {
    return new Promise(resolve => {
      zip(
        this.httpClient.get(`assets/tmp/i18n/${this.i18n.defaultLang}.json`),
        this.httpClient.get('assets/tmp/app-data.json'),
      )
        .pipe(
          // 接收其他拦截器后产生的异常消息
          catchError(([langData, appData]) => {
            resolve(null)
            return [langData, appData]
          }),
        )
        .subscribe(
          ([langData, appData]) => {
            // setting language data
            this.translate.setTranslation(this.i18n.defaultLang, langData)
            this.translate.setDefaultLang(this.i18n.defaultLang)

            // application data
            const res: any = appData
            // 应用信息：包括站点名、描述、年份
            this.settingService.setApp(res.app)
            // 用户信息：包括姓名、头像、邮箱地址
            this.settingService.setUser(res.user)
            // Role：设置权限为全量
            this.roleService.setFull(true)
            // 初始化菜单
            this.menuService.add(res.menu)
            // 设置页面标题的后缀
            this.titleService.default = ''
            this.titleService.suffix = res.app.name
          },
          () => {},
          () => {
            resolve(null)
          },
        )
    })
  }
}
