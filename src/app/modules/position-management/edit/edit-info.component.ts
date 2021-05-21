import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { PositionManagementService } from '../service/position-management.service'
import { ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService, NzTreeNode } from 'ng-zorro-antd'
import { DataState, TreeSourceOpts } from '../../organization/interfaces/organization.model'
import { ScrollBarHelper } from '../../../utils/scrollbar-helper'
import PerfectScrollbar from 'perfect-scrollbar'
import { map, mergeMap, switchMap, tap } from 'rxjs/operators'
import { of } from 'rxjs'
interface PositionOpts {
  id: string
  organizationDimensionId: string
  organizationId: string
  superior?: {},
  superiorId:string
}
const { hasOwnProperty } = Object.prototype
@Component({
  selector: 'app-edit-info',
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.less'],
})
export class EditInfoComponent implements OnInit, AfterViewInit {
  validateForm!: FormGroup
  // modal
  isVisible = false
  superiorIsVisible = false
  selectedOrganNode: NzTreeNode
  selectedOrganMapPositionNode: NzTreeNode
  isRelated: boolean // 是否关联组织
  positionStatusOptions = [
    { label: '启用', value: 'ENABLE' },
    { label: '禁用', value: 'DISABLE' },
  ]
  isisSupervisorOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
  ]
  pageState = DataState.LOADING
  tableData: any[] = []
  scrollbar: PerfectScrollbar
  totalcount = 0
  pagesize = 20
  pagecount = 1
  pageindex = 1
  // tree
  nodeOpts: TreeSourceOpts
  positionInfo: PositionOpts
  name: string // 职位名称
  tableItem: any
  constructor(
    private pmService: PositionManagementService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private router: Router,
    private elementRef: ElementRef,
    private changeDel: ChangeDetectorRef,
  ) {
    this.validateForm = this.fb.group({
      organName: [null, Validators.required],
      code: [null],
      name: [null],
      isSupervisor: [null],
      superiorName: [null],
      status: [{ value: null, disabled: false }, Validators.required],
      customField: [null],
      description: [null],
    })
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        tap(res => {
          const { isRelated } = JSON.parse(res.data || {})
          this.isRelated = Boolean(isRelated)
        }),
        map(res => {
          const { id } = JSON.parse(res.data || {})
          return id
        }),
        switchMap(id => {
          if(id){
            return this.pmService.getPositionInfoById(id)
          }
          return of({data:undefined}) // 转化成Observable对象
        }),
        map(resp => resp.data),
        mergeMap(res => {
           if(res){
             return this.pmService.getOrganizationInfo({ typeEnum: 'ORGANIZATION', ids: [res.organizationId] }).pipe(
               map(orgResp => {
                 return {
                   ...res,
                   organizationName: orgResp.data[0].name,
                 }
               }),
             )
           }
           return of(undefined)
        }),
      )
      .subscribe(data => {
        this.positionInfo = data
        // tslint:disable-next-line:no-unused-expression
        data && this.validateForm.patchValue({
          code: data.code,
          name: data.name,
          isSupervisor: data.isSupervisor,
          superiorName: data.superior.name,
          status: data.status,
          customField: '',
          description: data.desc,
          organName: data.organizationName,
        })
      })
  }
  ngAfterViewInit() {}

  /**
   * 跳转页数
   */
  pageIndexChange(newPage: number) {
    this.pageindex = newPage
    this.loadData()
  }

  /**
   * 每页显示的条数
   */
  pageSizeChange($event: number) {
    this.pagesize = $event
    this.pageindex = 1
    this.loadData()
  }
  getTreeData() {
    this.pmService
      .getOrganizationTree({
        organizationDimensionId: this.positionInfo && this.positionInfo.organizationDimensionId,
        organizationId: this.positionInfo && this.positionInfo.organizationId,
      })
      .subscribe(res => {
        if (+res.result.code === 0) {
          const { data }: { data: TreeSourceOpts } = res
          if (!data || !data.id) return
          this.nodeOpts = data
        }
      })
  }
  loadData() {
    this.pageState = DataState.LOADING
    const params = {
      page: { size: this.pagesize, current: this.pageindex },
      positionId: this.positionInfo && this.positionInfo.id, // 相当于过滤条件，过滤掉当前职位
      organizationId: (this.selectedOrganMapPositionNode && this.selectedOrganMapPositionNode.key) || '',
      name: this.name,
    }
    this.pmService.getPositionListByRule(params).subscribe(res => {
      const { data, page } = res
      this.pagecount = (page && page.size) || this.pagesize
      this.totalcount = (page && page.total) || 0
      this.tableData = (data && data.map(item => ({ ...item, isSelected: false }))) || [] // 每一项默认不选中
      // 获取表头
      if (this.tableData.length) {
        this.pageState = DataState.EXIST_DATA
        setTimeout(() => {
          const warp = document.querySelector('.right .ant-table-body')
          if (warp) {
            this.scrollbar = ScrollBarHelper.makeScrollbar(warp)
          }
        }, 1)
      } else {
        this.pageState = DataState.EMPTY
      }
      this.changeDel.detectChanges()
    })
  }
  add() {
    this.isVisible = true
    this.getTreeData()
  }
  clear() {
    this.validateForm.patchValue({ organName: null })
  }
  handleCancel() {
    this.isVisible = false
  }

  handleOk() {
    if (!this.selectedOrganNode) {
      this.msg.warning('未选择任何组织')
    }
    this.validateForm.patchValue({ organName: this.selectedOrganNode.origin.title })
    this.isVisible = false
  }
  getNodeInfo(node: NzTreeNode) {
    this.selectedOrganMapPositionNode = node
    this.loadData()
  }
  getCurrentNode(node: NzTreeNode) {
    this.selectedOrganNode = node
  }
  savePosition() {
    let request
    const { validateForm } = this
    if (validateForm.invalid) {
      for (const i of Object.keys(validateForm.controls)) {
        validateForm.controls[i].markAsDirty()
        validateForm.controls[i].updateValueAndValidity()
      }
      return
    }
    const val = validateForm.getRawValue()
    const params = {
      ...this.positionInfo,
      ...val,
      organizationId: (this.selectedOrganNode && this.selectedOrganNode.key) || this.positionInfo.organizationId,
      superiorId: this.tableItem && this.tableItem.id || this.positionInfo.superiorId,
    }
    // 编辑
    if (this.positionInfo && hasOwnProperty.call(this.positionInfo, 'id')) {
      request = this.pmService.updatePosition(params)
    } else {
      // 新增
      params.organizationDimensionId = 'DEFAULT_DIMENSION'
      request = this.pmService.addPosition(params)
    }
    request.subscribe(res => {
      if (res.result.code === 0) {
        this.msg.success('操作成功')
        this.doCancel()
      } else {
        const msg = res.result.message || '操作失败'
        this.msg.error(msg)
      }
    })
  }
  doCancel() {
    window.history.back()
  }
  addSuperiorPosition() {
    this.superiorIsVisible = true
    // 获取树数据
    this.getTreeData()
    // 获取表格数据
    this.loadData()
  }
  clearSelected() {
    this.validateForm.patchValue({ superiorName: null })
  }
  handleSuperiorCancel() {
    this.superiorIsVisible = false
  }
  handleSuperiorOk() {
    this.superiorIsVisible = false
    this.validateForm.patchValue({ superiorName: this.tableItem.name })
  }
  changeRadio(i: number, tableItem) {
    this.tableItem = tableItem
    console.log(tableItem)
    this.tableData.forEach((item, index) => {
      item.isSelected = i === index
    })
  }
  queryPosition() {
    this.loadData()
  }
}
