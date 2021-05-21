import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NzMessageService } from 'ng-zorro-antd'
import { forkJoin, from, Subscription } from 'rxjs'
import { filter, map, mergeMap, tap } from 'rxjs/operators'
import { OrganizationService } from '../service/organization.service'
import { SystemUtilsService } from 'knx-vui'
import { TreeResData } from '../interfaces/organization.model'
import { AuthService } from '@core/auth.service'
import * as moment from 'moment'
import { _HttpClient } from '@knz/theme'
import PerfectScrollbar from 'perfect-scrollbar'
import { ScrollBarHelper } from 'src/app/utils/scrollbar-helper'

@Component({
  selector: 'app-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.less'],
})
export class MergeComponent implements OnInit, OnDestroy {
  // router
  redirectUrl = '/organization/info'
  listOrg: any[]
  listPos: any[]
  loading = true

  subscrip: Subscription
  organizationId = ''
  organizationName = ''

  effectiveDate = new Date() // 生效日期
  sydate = new Date()
  username: string

  scrollbarOrg: PerfectScrollbar
  scrollbarPos: PerfectScrollbar
  constructor(
    public orgService: OrganizationService,
    private msg: NzMessageService,
    private actRouter: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private sysuiService: SystemUtilsService,
    public http: _HttpClient,
    public elementRef: ElementRef,
  ) {
    this.username = this.authService.getUserInfo().name
  }

  ngOnInit() {
    this.subscrip = this.actRouter.params
      .pipe(
        map(res => res.id),
        filter(id => !!id),
        tap(id => (this.organizationId = id)),
        mergeMap(id => forkJoin([this.orgService.getOrninfoById(id), this.orgService.getPositionsList(id)])),
      )
      .subscribe(([listOrg, listPos]) => {
        this.loading = false
        if (!listOrg.result.code) {
          this.organizationName = listOrg.data.name
          const data = { ...listOrg.data, mergeMain: '是' }
          this.listOrg = [data] || []
        }
        if (!listPos.result.code) {
          this.listPos = listPos.data || []
        }

        setTimeout(() => {
          const warporg = this.elementRef.nativeElement.querySelector('.merge-org .ant-table-body')
          const warppos = this.elementRef.nativeElement.querySelector('.merge-position .ant-table-body')
          if (warporg || warppos) {
            this.scrollbarOrg = ScrollBarHelper.makeScrollbar(warporg, { suppressScrollX: true }) // X轴不启用
            this.scrollbarPos = ScrollBarHelper.makeScrollbar(warppos, { suppressScrollX: true }) // X轴不启用
          }
        }, 1)
      })
  }

  /** 新增组织 */
  addOrg(): void {
    const req$ = this.sysuiService
      .showOrgDialog({
        defaultCurrent: false, // 是否显示默认勾选下级
        multiple: true, // 多选
        checkable: true, // 是否可选
        showCheckSon: true, // 是否展示选中所有下级
        title: '部门选择',
        urlPrefix: ``,
        organizationDimensionId: 'DEFAULT_DIMENSION',
        orgId: this.organizationId,
        isDisplayDimension: false, // 显示维度
        isGetNodeWithSuperior: true,
      })
      .pipe(
        filter((data: TreeResData[]) => !!(data && data.length)),
        map(data =>
          data.map(el => {
            return {
              id: el.key,
              name: el.title,
              code: el.code,
              superior: { name: el.ptitle },
              mergeMain: '',
            }
          }),
        ),
        map(data => {
          const oldlist: any[] = this.listOrg.map((el: { id: string }) => el.id)
          return data.filter(el => !oldlist.includes(el.id))
        }),
        filter(list => !!list.length),
        tap(datas => {
          this.listOrg = [...this.listOrg, ...datas]
          this.scrollbarOrg.update()
        }),
        map(lists => lists.map(el => el.id)),
        mergeMap(ids => this.orgService.getBatchPosList({ organizationIds: ids })),
        filter(res => {
          return !!(res.data && res.data.length)
        }),
        map(res => res.data),
      )
      .subscribe(data => {
        this.listPos = [...this.listPos, ...data]
        this.scrollbarPos.update()
      })
  }

  /** 获取职位 */
  getPosition(id: string) {
    return this.orgService.getPositionsList(id).pipe(
      map(res => {
        if (res.data && res.data.length) {
          return res.data.map((el: any) => {
            return { ...el, delPositionid: id }
          })
        } else {
          return []
        }
      }),
    )
  }

  /** 删除本地组织 */
  delLocal(id: string) {
    const tmp_org = this.listOrg.filter(el => el.id !== id)
    this.listOrg = [...tmp_org]
    this.elementRef.nativeElement.querySelector('.merge-org .ant-table-body').scrollTop = 0
    this.scrollbarOrg.update()

    const tmp_pos = this.listPos.filter(el => el.delPositionid !== id)
    this.listPos = [...tmp_pos]
    this.elementRef.nativeElement.querySelector('.merge-position .ant-table-body').scrollTop = 0
    this.scrollbarPos.update()
  }

  /** save */
  mergeOrg() {
    if (!this.organizationId) {
      this.msg.error('缺少组织')
      return
    }
    if (!this.listOrg.length) {
      this.msg.error('缺少合并组织')
      return
    }
    if (!this.effectiveDate) {
      this.msg.warning('生效日期不能为空')
      return
    }

    const managementPositionIds = this.listPos.length ? this.listPos.filter(el => el.isSupervisor).map(el => el.id) : []
    const mergedOrganizationIds = this.listOrg.length ? this.listOrg.map(el => el.id) : []

    const pdata = {
      mainOrganizationId: this.organizationId,
      organizationName: this.organizationName,
      managementPositionIds,
      mergedOrganizationIds,
      effectiveDate: moment(this.effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
    }

    this.orgService.mergeOrg(pdata).subscribe(res => {
      if (res.result && res.result.code === 0) {
        this.msg.success('合并成功')
        this.router.navigate([this.redirectUrl])
      } else {
        const { message } = res.result
        this.msg.error(message || '合并失败')
      }
    })
  }

  ngOnDestroy() {
    if (this.subscrip) {
      this.subscrip.unsubscribe()
    }
    if (this.scrollbarOrg) {
      this.scrollbarOrg.destroy()
      this.scrollbarOrg = null
    }
    if (this.scrollbarPos) {
      this.scrollbarPos.destroy()
      this.scrollbarPos = null
    }
  }
}
