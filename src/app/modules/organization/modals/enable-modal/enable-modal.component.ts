import { Component, Input, OnInit } from '@angular/core'
import { AuthService } from '@core/auth.service'

@Component({
  selector: 'app-enable-modal',
  template: `
    <div class="enable-content">
      <div class="modal-tips">是否确定{{ title }}？</div>
      <div class="form-warp">
        <form nz-form>
          <nz-form-item>
            <nz-form-label [nzSpan]="6" [nzNoColon]="true">生效日期</nz-form-label>
            <nz-form-control [nzSpan]="18">
              <nz-date-picker [(ngModel)]="date" name="date"></nz-date-picker>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6" [nzNoColon]="true">操作人</nz-form-label>
            <nz-form-control [nzSpan]="18"> {{ username }} </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label [nzSpan]="6" [nzNoColon]="true">操作日期</nz-form-label>
            <nz-form-control [nzSpan]="18">
              {{ sydate | date: 'yyyy/MM/dd HH:mm:ss' }}
            </nz-form-control>
          </nz-form-item>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-tips {
        font-size: 17px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #f5a623;
        line-height: 24px;
        margin: 18px 0;
      }

      ::ng-deep .enable-content .ant-form-item-label {
        text-align: left;
      }
      ::ng-deep .enable-content .ant-form-item {
        margin-bottom: 10px;
      }
      ::ng-deep .enable-disable-box .ant-modal-footer {
        border-top: 0;
      }
      ::ng-deep .enable-disable-box .ant-modal-header {
        border-bottom: 1px dashed #c4c8d5;
      }
    `,
  ],
})
export class EnableModalComponent implements OnInit {
  @Input() title: string
  date: Date
  constructor(private authService: AuthService) {}
  username: string
  sydate = new Date()
  ngOnInit() {
    this.username = this.authService.getUserInfo().name
  }
}
