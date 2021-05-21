import {
  OnInit,
  OnDestroy,
  Input,
  Output,
  ViewChild,
  Renderer2,
  Component,
  ElementRef,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core'
import { NzPaginationComponent } from 'ng-zorro-antd'
import { merge, Subject } from 'rxjs'
import { takeUntil, debounceTime } from 'rxjs/operators'

@Component({
  selector: 'vx-pagination',
  exportAs: 'vxPagination',
  template: `
    <nz-pagination
      nzShowSizeChanger
      [nzTotal]="totalCount"
      [nzDisabled]="disabled"
      [(nzPageIndex)]="pageIndex"
      [(nzPageSize)]="pageSize"
      [nzPageSizeOptions]="pageSizeOptions"
      (nzPageSizeChange)="pageSizeChange.emit($event)"
      (nzPageIndexChange)="pageIndexChange.emit($event)"
    ></nz-pagination>
    <div class="os-pagination-total">共{{ pageCount }}页 ({{ totalCount || 0 }}条)</div>
  `,
  styleUrls: ['./pagination.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnInit, OnDestroy {
  @Input() disabled: boolean
  @Input() pageSize: number
  @Input() pageIndex: number
  @Input() totalCount: number
  // tslint:disable-next-line:no-output-native
  @Output() change = new EventEmitter<void>()
  @Output() pageSizeChange = new EventEmitter<number>()
  @Output() pageIndexChange = new EventEmitter<number>()
  @ViewChild(NzPaginationComponent, { static: true }) pagination: NzPaginationComponent

  @HostBinding('class') get componentClass() {
    return 'os-pagination'
  }

  private destory$ = new Subject<void>()

  pageSizeOptions: number[] = [100, 80, 60, 40, 20]

  get pageCount() {
    return this.totalCount ? Math.ceil(this.totalCount / this.pageSize) : 0
  }

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    // theme === 'dark' && renderer.addClass(elementRef.nativeElement, 'backstage-pagination');
  }

  ngOnInit() {
    merge(this.pageIndexChange, this.pageSizeChange)
      .pipe(takeUntil(this.destory$), debounceTime(0))
      .subscribe(() => this.change.emit())
  }

  ngOnDestroy() {
    this.destory$.next()
    this.destory$.complete()
  }
}
