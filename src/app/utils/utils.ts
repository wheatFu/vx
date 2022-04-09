import * as moment from 'moment'
/**
 * 创建blob对象，并利用浏览器打开url进行下载
 * @param stream: 文件流数据
 * @param type: 下载文件类型 1:text/csv  2:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 */
export const downLoadFile = (stream, filename, type?) => {
  const reg = /(?<==).*/gi
  const result = filename.match(reg)
  filename = result.length > 0 ? result[0].replace(/.xlsx/gi, '') : ''
  // 转化的文件类型 text/csv 的文件类型 , xlsx文件类型
  type = type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const blob = new Blob([stream], { type })
  const url = window.URL.createObjectURL(blob)
  // 打开新窗口方式进行下载
  // window.open(url)

  // 以动态创建a标签进行下载
  const a = document.createElement('a')
  a.href = url
  const DATE = new Date()
  a.download = `${moment(DATE).format('YYYYMMDDHHmm')}_${filename}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
/**
 * @description:解析路由参数.以对象的形式返回
 * @param url 地址
 * @return 以key-value的形式返回路由参数
 */
export const parseQueryParam = url => {
  const _get_query_params_reg = /[?&]([^&]+)=([^&]+)/gi
  const _remove_special_symbol_reg = /[?&]/gi
  const _match_results = url.match(_get_query_params_reg) || []
  return _match_results.reduce((prev, next) => {
    next = next.replace(_remove_special_symbol_reg, '')
    const [key, value] = next.split('=')
    prev[key] = value
    return prev
  }, {})
}
