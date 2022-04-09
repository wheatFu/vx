import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core'
import {
  Router,
  RouteConfigLoadStart,
  NavigationError,
  NavigationCancel,
  NavigationEnd,
  RouteConfigLoadEnd,
} from '@angular/router'
import { SettingsService } from '@knz/theme'
import { updateHostClass } from '@knz/util'
import { NzMessageService } from 'ng-zorro-antd'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
})
export class BasicComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$ = new Subject<void>()
  @ViewChild('settingHost', { read: ViewContainerRef, static: true })
  private settingHost: ViewContainerRef
  isFetching = false

  constructor(
    router: Router,
    _message: NzMessageService,
    private resolver: ComponentFactoryResolver,
    private settings: SettingsService,
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: any,
  ) {
    // scroll to top in change page
    router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(evt => {
      if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
        this.isFetching = true
      }
      if (evt instanceof NavigationError || evt instanceof NavigationCancel) {
        this.isFetching = false
        if (evt instanceof NavigationError) {
          _message.error(`无法加载${evt.url}路由`, { nzDuration: 1000 * 3 })
        }
        return
      }
      if (!(evt instanceof NavigationEnd || evt instanceof RouteConfigLoadEnd)) {
        return
      }
      if (this.isFetching) {
        setTimeout(() => {
          this.isFetching = false
        }, 100)
      }
    })
  }

  private setClass() {
    const { el, doc, renderer, settings } = this
    const layout = settings.layout
    updateHostClass(el.nativeElement, renderer, {
      ['knz-default']: true,
      [`knz-default__fixed`]: layout.fixed,
      [`knz-default__collapsed`]: layout.collapsed,
    })

    doc.body.classList[layout.colorWeak ? 'add' : 'remove']('color-weak')
  }

  ngAfterViewInit(): void {
    // Setting componet for only developer
    if (true) {
      setTimeout(() => {
        // const settingFactory = this.resolver.resolveComponentFactory(SettingDrawerComponent);
        // this.settingHost.createComponent(settingFactory);
      }, 22)
    }
  }

  ngOnInit() {
    const { settings, unsubscribe$ } = this
    settings.notify.pipe(takeUntil(unsubscribe$)).subscribe(() => this.setClass())
    this.setClass()
  }

  ngOnDestroy() {
    const { unsubscribe$ } = this
    unsubscribe$.next()
    unsubscribe$.complete()
  }
}
