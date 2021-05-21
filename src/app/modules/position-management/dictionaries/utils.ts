export function attrDecorate(params) {
  return (target, key) => {
    console.log(target, key) // target =>当前对象即组件实例，key：属性
    let val = target[key]
    // 数据劫持，数据代理
    Object.defineProperty(target, key, {
      get() {
        return val
      },
      set(value) {
        val = '我的名字叫' + value
      },
    })
  }
}
export function methodDecorate(msg) {
  return (target, key, descriptor) => {
    // target：当前对象，key：函数名, dec：{writable: true, enumerable: false, configurable: true, value: ƒ}
    const { value: oldFn } = descriptor
    descriptor.value = () => {
      const flag = window.confirm(msg) // 加上确认弹出框
      if (flag) {
        oldFn.call(target, flag)
      }
    }
  }
}
export default function test() {
  console.log('hello world')
}
// 发布订阅模式
export const EventEmitter = (()=>{
  const _message = {}
  return {
    // 订阅消息类型
    $subscribe: (key, fn) => {
      if (typeof _message[key] === 'undefined') {
        _message[key] = [fn]
      } else {
        _message[key].push(fn)
      }
    },
    // 发布消息
    $publish(key, params){
      if (_message[key].length) return
      const fns = _message[key]
      const extra = {
        type: key,
        params,
      }
      fns.forEach(fn => fn.call(this, extra))
    },
    // 移除消息类型
    $off: (key, fn) => {
      if (_message[key].length) return
      const fns = _message[key]
      for (let i = 0; i < fns.length; i++) {
        if (fns[i] === fn) {
          fns.splice(i, 1)
        }
      }
    },
  }
})()
