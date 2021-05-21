import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core'
import G6, { IG6GraphEvent, ModelConfig, TreeGraph } from '@antv/g6'
import { of } from 'rxjs'
import { mergeMap, map, tap } from 'rxjs/operators'
import { GraphExtdata, OrTreeGraphDat, TreeSourceOpts } from '../../interfaces/organization.model'
import { OrganizationService } from '../../service/organization.service'

@Component({
  selector: 'app-org-graph',
  template: `
    <div class="glass">
      <div class="img img-left" (click)="glassHandle(1)"></div>
      <span>{{ zoom }}%</span>
      <div class="img img-right" (click)="glassHandle(2)"></div>
    </div>
    <div id="container"></div>
  `,
  styles: [
    `
      .glass {
        width: 107px;
        padding-right: 20px;
        position: absolute;
        right: 0;
        font-size: 14px;
        font-weight: 500;
        color: #9ba1b5;
        text-align: center;
        margin-top: 22px;
        line-height: 38px;
      }
      .img {
        margin-top: 11px;
        width: 16px;
        height: 16px;
        background-size: 100% 100%;
        cursor: pointer;
      }
      .img-left {
        float: left;
        background-image: url(./assets/images/ic_narrow@2x.png);
      }
      .img-right {
        float: right;
        background-image: url(./assets/images/ic_enlarge@2x.png);
      }
    `,
  ],
})
export class OrgGraphComponent implements OnInit, OnChanges, OnDestroy {
  @Input() explandLevel: number
  @Input() data: TreeSourceOpts
  graph: TreeGraph
  width: number
  height: number
  zoom = 50
  color = ['#978DEB', '#86CFFF', '#FFC066', '#9d98ca', '#4c4684', '#56825b', '#9c6099', '#babd66', '#b3505b', '#e070c5']

  extDat: GraphExtdata

  constructor(public elementRef: ElementRef, private orgService: OrganizationService) {}

  ngOnChanges(changesValue: SimpleChanges) {
    if (this.graph && this.data) {
      const dat = this.transPraphOpts([this.data], 1)[0]
      this.graph.changeData(dat)
      this.graph.fitCenter()

      if (this.explandLevel >= 3) {
        this.graph.zoom(0.5, { x: this.width / 2, y: 50 })
      }
    }
  }
  ngOnInit() {
    this.width = this.elementRef.nativeElement!.clientWidth || 500
    this.height = this.elementRef.nativeElement!.clientHeight || 500

    if (this.data) {
      of(this.data)
        .pipe(
          map(this.getTreeId),
          mergeMap(ids => this.getExtdat(ids)),
          tap(res => (this.extDat = res.data)),
        )
        .subscribe(() => {
          this.getPraph(this.width, this.height, this.transPraphOpts([this.data], 1)[0])
          console.log(this.transPraphOpts([this.data], 1)[0])
        })
    }
  }

  /** 根据组织id获取额外数据 */
  getExtdat(dat: string[]) {
    return this.orgService.getTreeExtdat(dat)
  }

  /** 获取树id */
  getTreeId(dat: TreeSourceOpts): string[] {
    const res = []
    const stack = []

    stack.push(dat)
    while (stack.length) {
      const node = stack.pop()
      res.push(node.id)

      if (node.subOrganizations.length) {
        stack.push(...node.subOrganizations)
      }
    }
    return res
  }

  /** 转换数据源 */
  transPraphOpts(dat: TreeSourceOpts[], level: number): OrTreeGraphDat[] {
    return dat.map(el => {
      const item = this.extDat[el.id] || ''
      const managers = (item && item.managers) || ''
      const manArr = managers.split('，')
      const position = manArr.length && manArr.length > 2 ? manArr.slice(0, 2).join(',') + '...' : managers

      el = { ...el, level }
      const common = {
        id: el.id,
        label: el.name,
        level,
        bgColor: this.color[Math.floor(Math.random() * 10)],
        position,
        zws: (item && item.positionNum) || '-',
        ygs: (item && item.employeeNum) || '-',
      }

      if (
        el.subOrganizations &&
        el.subOrganizations.length &&
        (this.explandLevel === -1 || level < this.explandLevel)
      ) {
        return {
          ...common,
          children: this.transPraphOpts(el.subOrganizations, +el.level + 1),
        }
      } else {
        return common
      }
    })
  }

  getPraph(width: number, height: number, treeData: OrTreeGraphDat) {
    // 自定义节点
    G6.registerNode('rectNode', {
      draw: (cfg: ModelConfig, group) => {
        // 最外面的那层
        const shape = group.addShape('rect', {
          draggable: false,
          attrs: {
            width: 272,
            height: 144,
            fill: cfg.bgColor as string,
            radius: 4,
            shadowColor: '#6071DF',
            shadowBlur: 4,
          },
        })

        const pBBox = shape.getBBox()

        // 里面的那层
        group.addShape('rect', {
          draggable: false,
          attrs: {
            x: pBBox.x + 8,
            y: pBBox.y + 8,
            width: 256,
            height: 128,
            lineWidth: 2,
            stroke: '#F6F7FB', // 边框
            radius: [0, 0, 4, 4],
            lineDash: [2, 8],
          },
        })

        // 头像
        group.addShape('image', {
          attrs: {
            x: pBBox.x + 18, // 8 +10
            y: pBBox.y + 21, // 8 + 13
            width: 36,
            height: 36,
            img: 'assets/images/female.png',
          },
          name: 'image-shape',
        })
        // 组织名称
        group.addShape('text', {
          attrs: {
            x: pBBox.x + 60,
            y: pBBox.y + 32,
            text: cfg.label,
            fill: '#fff',
            fontSize: 17,
          },
        })
        // 部门主管
        group.addShape('text', {
          attrs: {
            x: pBBox.x + 60,
            y: pBBox.y + 52, // 32+12+10
            text: cfg.position,
            fill: '#fff',
            fontSize: 13,
          },
        })
        // 在职人数 图层
        group.addShape('rect', {
          draggable: false,
          attrs: {
            x: pBBox.x + 8,
            y: pBBox.y + 68,
            width: 256,
            height: 68,
            radius: 2,
            fill: '#fff',
          },
        })

        group.addShape('text', {
          attrs: {
            x: pBBox.x + 49,
            y: pBBox.y + 100,
            text: '职位数',
            fill: cfg.bgColor as string,
            fontSize: 13,
          },
        })
        // 职位数量
        group.addShape('text', {
          attrs: {
            x: pBBox.x + 52,
            y: pBBox.y + 125,
            text: cfg.zws,
            fill: cfg.bgColor as string,
            fontSize: 18,
          },
        })

        group.addShape('text', {
          attrs: {
            x: pBBox.x + 183,
            y: pBBox.y + 100,
            text: '人员数',
            fill: cfg.bgColor as string,
            fontSize: 13,
          },
        })

        // 人员数量
        group.addShape('text', {
          attrs: {
            x: pBBox.x + 186,
            y: pBBox.y + 125,
            text: cfg.ygs,
            fill: cfg.bgColor as string,
            fontSize: 18,
          },
        })

        if (cfg.children && (cfg.children as []).length) {
          group.addShape('circle', {
            attrs: {
              x: pBBox.width / 2,
              y: pBBox.height - 5,
              r: 16,
              cursor: 'pointer',
              fill: cfg.collapsed ? '#7E8BE0' : '#A29C9C',
            },
            name: 'collapse-back',
            modelId: cfg.id,
          })

          // collpase text
          group.addShape('text', {
            attrs: {
              x: pBBox.width / 2,
              y: pBBox.height - 4,
              textAlign: 'center',
              textBaseline: 'middle',
              text: cfg.collapsed ? '+' : '-',
              fontSize: 18,
              cursor: 'pointer',
              fill: '#fff',
            },
            name: 'collapse-text',
            modelId: cfg.id,
          })
        }
        return shape
      },
      setState(name, value, item) {
        if (name === 'collapse') {
          const group = item.getContainer()
          const collapseText = group.find(e => e.get('name') === 'collapse-text')
          const collapseBack = group.find(e => e.get('name') === 'collapse-back')
          if (collapseText || collapseBack) {
            if (!value) {
              collapseText.attr({ text: '-' })
              collapseBack.attr({ fill: '#A29C9C' })
            } else {
              collapseText.attr({ text: '+' })
              collapseBack.attr({ fill: '#7E8BE0' })
            }
          }
        }
      },
    })
    // 自定义边
    G6.registerEdge('flow-line', {
      draw(cfg, group) {
        const startPoint = cfg.startPoint
        const endPoint = cfg.endPoint

        const shape = group.addShape('path', {
          attrs: {
            stroke: '#A29C9C',
            path: [
              ['M', startPoint.x, startPoint.y],
              ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
              ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
              ['L', endPoint.x, endPoint.y],
            ],
          },
        })

        return shape
      },
    })

    this.graph = new G6.TreeGraph({
      container: 'container',
      width,
      height,
      linkCenter: true,
      modes: {
        default: [
          {
            type: 'collapse-expand',
            onChange: function onChange(item, collapsed) {
              const data = item.getModel()
              data.collapsed = collapsed
              this.graph.setItemState(item, 'collapse', !!collapsed)
              return true
            },
          },
          'drag-canvas',
          'zoom-canvas',
        ],
      },
      defaultNode: {
        size: [274, 124],
        type: 'rectNode',
        anchorPoints: [
          [0.5, 1],
          [0.5, 0],
        ],
      },
      defaultEdge: {
        type: 'flow-line',
      },

      // 紧凑
      layout: {
        type: 'compactBox',
        direction: 'TB',
        getId: function getId(d: { id: any }) {
          return d.id
        },
        getHeight: function getHeight() {
          return 124
        },
        getWidth: function getWidth() {
          return 274
        },
        getVGap: function getVGap() {
          // 垂直
          return 100
        },
        getHGap: function getHGap() {
          // 水平
          return 40
        },
      },
    })

    this.graph.data(treeData)
    this.graph.render()
    this.graph.fitCenter()
    this.graph.zoom(0.5, { x: width / 2, y: 50 })
    this.graph.setMaxZoom(1.05)

    this.graph.on('wheel', e => {
      this.handleWheel()
    })

    // 展开/关闭事件 [只作用于小按钮]
    // this.graph.on('collapse-text:click', (e) => {
    //   this.handleCollapse(e);
    // });
    // this.graph.on('collapse-back:click', (e) => {
    //   this.handleCollapse(e);
    // });
  }

  handleCollapse = (e: IG6GraphEvent) => {
    const target = e.target
    const id = target.get('modelId')
    const item = this.graph.findById(id)
    const nodeModel = item.getModel()
    nodeModel.collapsed = !nodeModel.collapsed
    this.graph.setItemState(item, 'collapse', !!nodeModel.collapsed)
    this.graph.layout()
  }

  /** 鼠标滚轮事件 */
  handleWheel() {
    this.zoom = +this.graph.getZoom().toFixed(1) * 100
  }

  /** 放大缩小点击 */
  glassHandle(tp: number) {
    const zoom = this.zoom
    if ((zoom >= 100 && tp === 2) || (zoom <= 20 && tp === 1)) {
      return
    }

    const af_zoom = tp === 1 ? zoom - 10 : zoom + 10
    this.zoom = af_zoom
    this.graph.zoomTo(af_zoom / 100, { x: this.width / 2, y: 50 })
  }

  ngOnDestroy() {
    if (this.graph) {
      this.graph.destroy()
    }
  }
}
