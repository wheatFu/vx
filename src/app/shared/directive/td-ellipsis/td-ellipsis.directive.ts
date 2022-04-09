import { Directive, ElementRef, Input, Renderer2, ViewContainerRef } from '@angular/core'

@Directive({
  selector: '[appTdEllipsis]',
})
export class TdEllipsisDirective {
  @Input() set appTdEllipsis(data: string) {
    const span = this.render.createElement('span')
    const text = this.render.createText(data)
    this.render.setProperty(span, 'title', data)
    this.render.addClass(span, 'td-ellipsis')
    this.render.appendChild(span, text)
    this.render.appendChild(this.el.nativeElement, span)
  }

  constructor(public viewContainerRef: ViewContainerRef, private render: Renderer2, private el: ElementRef) {}
}
