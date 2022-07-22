import { Directive, Inject, Input, TemplateRef, ViewContainerRef } from '@angular/core'

// tslint:disable-next-line:no-unused-expression
// import type { NzSafeAny } from 'ng-zorro-antd/core/types';

export class LetContext<T> {
  constructor(private readonly dir: LetDirective<T>) {}

  get $implicit(): T {
    return this.dir.let
  }

  get let(): T {
    return this.dir.let
  }
}

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[let]' })
export class LetDirective<T> {
  @Input() let!: T

  constructor(@Inject(ViewContainerRef) vc: ViewContainerRef, @Inject(TemplateRef) ref: TemplateRef<LetContext<T>>) {
    vc.createEmbeddedView(ref, new LetContext<T>(this))
  }

  static ngTemplateContextGuard<T>(_dir: LetDirective<T>, _ctx: any): _ctx is LetDirective<T> {
    return true
  }
}
