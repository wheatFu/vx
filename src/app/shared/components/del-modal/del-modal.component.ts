import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'vx-del-modal',
  template: `
    <div class="content">
      <span class="icon icon-ic_remind"></span>
      <div class="modal-tips">是否确定{{ title }}？</div>
    </div>
  `,
  styles: [
    `
      .content {
        text-align: center;
        padding-top: 25px;
        box-sizing: content-box;
      }
      .icon {
        color: #f8826f;
        font-size: 48px;
      }

      .modal-tips {
        margin: 10px 0 20px;
        font-size: 17px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #253238;
        line-height: 24px;
      }
      ::ng-deep .delete-box .ant-modal-footer {
        border-top: 0;
      }
      ::ng-deep .delete-box .ant-modal-header {
        border-bottom: 1px dashed #c4c8d5;
      }
    `,
  ],
})
export class DelModalComponent implements OnInit {
  @Input() title: string
  constructor() {}

  ngOnInit() {}
}
