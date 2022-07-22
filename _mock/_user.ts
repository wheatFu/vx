import { MockRequest } from '@knz/mock'

const list: any[] = []
const total = 50

for (let i = 0; i < total; i += 1) {
  list.push({
    id: i + 1,
    disabled: i % 6 === 0,
    href: 'https://ant.design',
    avatar: [
      'https://www.vxhcm.com/Upload/EmployeePhoto/AAABJ/WebSite/99.png',
      'https://www.vxhcm.com/Upload/EmployeePhoto/AAABJ/WebSite/99.png',
    ][i % 2],
    no: `TradeCode ${i}`,
    title: `一个任务名称 ${i}`,
    owner: '曲丽丽',
    description: '这是一段描述',
    callNo: Math.floor(Math.random() * 1000),
    status: Math.floor(Math.random() * 10) % 4,
    updatedAt: new Date(`2017-07 - ${Math.floor(i / 2) + 1}`),
    createdAt: new Date(`2017-07 - ${Math.floor(i / 2) + 1}`),
    progress: Math.ceil(Math.random() * 100),
  })
}

function genData(params: any) {
  let ret = [...list]
  const pi = +params.pi
  const ps = +params.ps
  const start = (pi - 1) * ps

  if (params.no) {
    ret = ret.filter(data => data.no.indexOf(params.no) > -1)
  }

  return { total: ret.length, list: ret.slice(start, ps * pi) }
}

function saveData(id: number, value: any) {
  const item = list.find(w => w.id === id)
  if (!item) return { msg: '无效用户信息' }
  Object.assign(item, value)
  return { msg: 'ok' }
}

export const USERS = {
  '/user': (req: MockRequest) => genData(req.queryString),
  '/user/:id': (req: MockRequest) => list.find(w => w.id === +req.params.id),
  'POST /user/:id': (req: MockRequest) => saveData(+req.params.id, req.body),
  'POST //auth/login': (req: MockRequest) => saveData(+req.params.id, req.body),
  '/user/current': {
    name: 'Jack',
    avatar: 'https://www.vxhcm.com/Upload/EmployeePhoto/AAABJ/WebSite/99.png',
    userid: '00000001',
    email: 'jackren@knx.com.cn',
    usercode: 'knx000987',
    signature: '定性、知事、选梦、遇人、择城、终老……',
    position: '苦逼的前端开发之一',
    organization: '肯耐珂萨－上海－ISC－前端开发',
    title: '苦逼的前端开发之一',
    group: '肯耐珂萨－上海－ISC－前端开发',
    tags: [
      {
        key: '0',
        label: '专注撩妹',
      },
      {
        key: '1',
        label: '喜欢美食',
      },
      {
        key: '2',
        label: '肥胖',
      },
      {
        key: '3',
        label: '肥胖肥胖滴',
      },
      {
        key: '4',
        label: '很丑很丑滴',
      },
      {
        key: '5',
        label: '专一',
      },
      {
        key: '6',
        label: '专注前端开发',
      },
      {
        key: '7',
        label: '程序猿',
      },
    ],
    notifyCount: 12,
    country: 'China',
    geographic: {
      province: {
        label: '上海',
        key: '330000',
      },
      city: {
        label: '市辖区',
        key: '330100',
      },
    },
    address: 'XX区XXX路 XX 号',
    phone: '你猜',
  },
  'POST /user/avatar': 'ok',
  'POST /auth/login': (req: MockRequest) => {
    const data = req.body
    if (!(data.userName === 'admin') || data.password !== '123456') {
      return { code: 0, msg: `账号密码（admin|123456）` }
    }
    return {
      msg: 'ok',
      user: {
        token: '123456789',
        name: data.userName,
        email: `${data.userName}@qq.com`,
        id: 10000,
        time: +new Date(),
      },
    }
  },
  'POST /register': {
    msg: 'ok',
  },
  'POST /updatepwd': {
    msg: 'ok',
  },
}
