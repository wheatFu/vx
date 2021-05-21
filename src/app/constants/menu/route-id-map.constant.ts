/**
 * 路由 ID 和真实前端路由 link 映射表
 * 路由 ID 用于在超管中配置页面的路由 ID
 * 菜单接口会返回页面的路由 ID，前端菜单根据路由 ID 来跳转到工程内页面
 * 中台的 “快捷菜单” 会使用路由 ID 跳转到其他前端工程的页面
 * 路由 ID 需要整个产品唯一，扁平化，超管中产品添加的页面这里都要配置
 * 格式：大写字母、数字和下划线，key 的长度不能超过 50
 * 映射值为从根路由开始的完整路径（Angular 里面的完整路由路径，不包含部署的子目录前缀）
 */
export const routeIdMap = {
  /**
   * 首页
   */
  VX_HOME: '/home',

  // 组织信息
  VX_ORGANIZATIONS_INFO: '/organization/info',

  VX_ORGANIZATIONS_CHANGE: '/organization/change',

  // 职位信息
  VX_POSITION_INFO: '/position/info',

  VX_POSITION_DICT: '/position/dict',
}
