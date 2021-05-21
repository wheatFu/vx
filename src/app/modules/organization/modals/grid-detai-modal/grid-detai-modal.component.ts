import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core'
import { iif } from 'rxjs'
import { OrganizationService } from '../../service/organization.service'
import PerfectScrollbar from 'perfect-scrollbar'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'

@Component({
  selector: 'app-grid-detai-modal',
  templateUrl: './grid-detai-modal.component.html',
  styles: [
    `
      .spin {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      ::ng-deep .grid-box .ant-modal-footer {
        border-top: 0;
      }
      ::ng-deep .grid-box .ant-modal-header {
        border-bottom: 1px dashed #c4c8d5;
      }
    `,
  ],
})
export class GridDetaiModalComponent implements OnInit, OnDestroy {
  listdata: any
  @Input() listType: number // 1职位列表，2雇员
  @Input() id: string
  scrollbar: PerfectScrollbar
  constructor(public orgService: OrganizationService, public elementRef: ElementRef) {}

  loading = true
  ngOnInit() {
    if (this.id) {
      iif(
        () => this.listType === 1,
        this.orgService.getPositionsList(this.id),
        this.orgService.getEmployeesList(this.id),
      ).subscribe(res => {
        this.loading = false
        const { result, data } = res
        if (result.code === 0 && data.length) {
          this.listdata = data
          setTimeout(() => {
            const warp = this.elementRef.nativeElement.querySelector('.ant-table-body')
            if (warp) {
              this.scrollbar = ScrollBarHelper.makeScrollbar(warp, { suppressScrollX: true }) // X轴不启用
            }
          }, 1)
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.scrollbar) {
      this.scrollbar.destroy()
      this.scrollbar = null
    }
  }
}
