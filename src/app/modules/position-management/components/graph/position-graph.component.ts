import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import G6, { ModelConfig, TreeGraph } from '@antv/g6'
import { PositionTreeGraphDat, TreeSourceOpts } from '../../interfaces/position.model'
@Component({
  selector: 'app-position-graph',
  template: `
    <div class="glass">
      <div class="img img-left" (click)="glassHandle(1)"></div>
      <span>{{ data.zoom }}%</span>
      <div class="img img-right" (click)="glassHandle(2)"></div>
    </div>
    <!--    <div [id]="'container' + index"></div>-->
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
        background-image: url('./assets/images/ic_narrow@2x.png');
      }
      .img-right {
        float: right;
        background-image: url('./assets/images/ic_enlarge@2x.png');
      }
    `,
  ],
})
export class PositionGraphComponent implements OnInit, OnChanges, OnDestroy {
  @Input() expandLevel: number
  @Input() data: TreeSourceOpts
  @Output() zoomEmit = new EventEmitter<{ id: string; zoom: number | string }>()
  graph: TreeGraph
  width: number
  height: number
  color = ['#978DEB', '#86CFFF', '#FFC066', '#9d98ca', '#4c4684', '#56825b', '#9c6099', '#babd66', '#b3505b', '#e070c5']
  ngOnChanges(changesValue: SimpleChanges) {
    if (this.graph) {
      if (Object.keys(this.data).length > 1) {
        const dat = this.transformGraphOpts(this.data)
        this.graph.changeData(dat)
        this.graph.fitCenter()
        this.graph.zoom(+this.data.zoom / 100, { x: this.width / 2, y: 50 }) // 每个tab对应的职位架构图的缩放比例
        this.graph.translate(100, 100) // 采用相对位移来平移画布。
      } else {
        // 无数据源时，（清除画布元素。该方法一般用于清空数据源，重新设置数据源，重新 render 的场景，此时所有的图形都会被清除 --来自G6官方解释）
        this.graph.clear()
      }
    }
  }
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // 宏任务  这里加上这个异步事件的目的时当获取目标dom元素的宽高时，先等数据接口请求完，然后再操作dom,获取宽高 （事件循环 EventLoop）
    setTimeout(_ => {
      this.width = this.elementRef.nativeElement!.clientWidth || 500
      this.height = this.elementRef.nativeElement!.clientHeight || 500
      if (this.data) {
        this.getGraph(this.width, this.height, this.transformGraphOpts(this.data))
      }
    }, 100)
  }

  /** 转换数据源 */
  transformGraphOpts(treeSourceOpts: TreeSourceOpts): PositionTreeGraphDat {
    const queue = []
    const nodeList = []
    let root: PositionTreeGraphDat = { bgColor: '', employeeNum: undefined, id: '' }
    if (!Object.keys(treeSourceOpts).length) return root
    queue.push({ ...treeSourceOpts, level: 1 })
    while (queue.length) {
      const node = queue.shift()
      nodeList.push(node)
      const { childPositions: children } = node
      if(node.level === this.expandLevel) continue
      if (children && children.length) {
        queue.push.apply(
          queue,
          children.map(item => ({ ...item, level: node.level + 1 })),
        )
      }
    }
    const id_map_graph_data = nodeList.reduce((prev, next) => {
      prev[next.id] = {
        id: next.id,
        name: next.name, // 职位名称
        organizationId: next.organizationId,
        organizationName: next.organizationName,
        bgColor: this.color[Math.floor(Math.random() * 10)],
        employeeNum: next.employeeNum || '--',
      }
      return prev
    }, {})
    for (const item of nodeList) {
      const parent = id_map_graph_data[item.superiorId]
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(id_map_graph_data[item.id])
      } else {
        root = id_map_graph_data[item.id]
      }
    }
    return root
  }

  getGraph(width: number, height: number, treeData: PositionTreeGraphDat) {
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
        // 职位名称
        group.addShape('text', {
          attrs: {
            x: pBBox.x + 60,
            y: pBBox.y + 32,
            text: cfg.name,
            fill: '#fff',
            fontSize: 17,
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
            text: '所属组织',
            fill: cfg.bgColor as string,
            fontSize: 13,
          },
        })
        // 职位数量
        group.addShape('text', {
          attrs: {
            x: pBBox.x + 49,
            y: pBBox.y + 125,
            text: cfg.organizationName,
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
            text: cfg.employeeNum,
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
      container: `container`,
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
    this.graph.translate(0, 100) // 采用相对位移来平移画布。
    this.graph.on('wheel', e => {
      this.handleWheel()
    })
  }
  /** 鼠标滚轮事件 */
  handleWheel() {
    const zoom = +this.graph.getZoom().toFixed(1) * 100
    const { data } = this
    this.data.zoom = zoom
    this.zoomEmit.emit({ zoom, id: data.id })
  }

  /** 放大缩小点击 */
  glassHandle(tp: number) {
    const zoom = +this.data.zoom
    if ((zoom >= 100 && tp === 2) || (zoom <= 20 && tp === 1)) {
      return
    }
    const af_zoom = tp === 1 ? zoom - 10 : zoom + 10
    this.data.zoom = af_zoom
    this.zoomEmit.emit({ zoom: af_zoom, id: this.data.id })
    this.graph.zoomTo(af_zoom / 100, { x: this.width / 2, y: 50 })
  }
  ngOnDestroy() {
    if (this.graph) {
      this.graph.destroy()
    }
  }
}
