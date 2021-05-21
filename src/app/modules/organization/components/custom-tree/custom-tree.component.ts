import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { NzTreeComponent, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd'
import { TreeSourceOpts } from '../../interfaces/organization.model'

@Component({
  selector: 'app-custom-tree',
  template: `
    <div class="default-warp">
      <nz-tree
        #tree
        [nzData]="nodes"
        nzDraggable
        nzBlockNode="false"
        [nzExpandAll]="true"
        (nzClick)="nodeClick($event)"
      >
      </nz-tree>
    </div>
  `,
  styles: [
    `
      .default-warp {
        height: 100%;
        overflow-y: auto;
      }
    `,
  ],
})
export class CustomTreeComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('tree', { static: false }) tree: NzTreeComponent

  @Input() nodeOpts: TreeSourceOpts
  @Input() expandAll: boolean

  @Output() node = new EventEmitter<NzTreeNode>()

  loading = true
  nodes: NzTreeNodeOptions[]

  constructor() {}

  // 监听传递过来的数据，发生变化则重新赋值
  ngOnChanges(changesValue: SimpleChanges) {
    this.initTree()
  }

  ngOnInit() {
    this.initTree()
  }

  ngAfterViewInit(): void {
    this.tree.nzExpandAll = this.expandAll ? true : false
  }

  initTree() {
    if (this.nodeOpts && Object.keys(this.nodeOpts).length) {
      this.nodes = this.transreeNodeOptions([this.nodeOpts])
    }
  }

  /**
   * 转换成树结构
   */
  transreeNodeOptions(dat: TreeSourceOpts[]): NzTreeNodeOptions[] {
    return dat.map(el => {
      const common = {
        title: el.name,
        key: el.id,
        disabled: el.isDisable ? true : false,
        organizationDimensionId: el.organizationDimensionId,
      }
      if (el.subOrganizations && el.subOrganizations.length) {
        return {
          ...common,
          children: this.transreeNodeOptions(el.subOrganizations),
        }
      } else {
        return {
          ...common,
          isLeaf: true,
        }
      }
    })
  }

  nodeClick(ev: { node: NzTreeNode }) {
    this.node.emit(ev.node)
  }
}
