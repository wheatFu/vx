export const SIDEBAR_MENU_DATA = {
  menu: [
    {
      group: true,
      i18n: 'menu.vx',
      hideInBreadcrumb: true,
      children: [
        {
          text: '首页',
          link: '/home',
          i18n: 'menu.hcm.home',
          icon: 'anticon-windows',
        },
        {
          text: '组织管理',
          i18n: 'menu.hcm.organization',
          icon: 'anticon-bar-chart',
          children: [
            {
              text: '组织信息',
              link: '/organization/info',
              i18n: 'menu.hcm.organization info',
            },
            {
              text: '组织变动查询',
              link: '/organization/change',
              i18n: 'menu.hcm.organization change',
            },
          ],
        },
        {
          text: '职位管理',
          link: '/position',
          i18n: 'menu.hcm.position',
          icon: 'anticon-appstore',
          children: [
            {
              text: '职位信息',
              link: '/info',
              i18n: 'menu.hcm.position info',
            },
            {
              text: '职位字典',
              link: '/dict',
              i18n: 'menu.hcm.position dict',
            },
          ],
        },
        {
          text: '人事管理',
          link: '/hr',
          i18n: 'menu.hcm.hr',
          icon: 'anticon-user',
          children: [
            {
              text: '入职管理',
              link: '/entry',
              i18n: 'menu.hcm.entry',
            },
            {
              text: '在职员工管理',
              link: '/job',
              i18n: 'menu.hcm.on the job',
            },
            {
              text: '离职员工管理',
              link: '/dimission',
              i18n: 'menu.hcm.dimission',
            },
            {
              text: '员工历史变更',
              link: '/history',
              i18n: 'menu.hcm.history',
            },
          ],
        },
        {
          text: 'demo',
          link: '/demo',
          i18n: 'menu.hcm.hr',
          icon: 'anticon-user',
          children: [
            {
              text: '入职管理',
              link: '/entry',
              i18n: 'menu.hcm.entry',
            },
          ],
        },
      ],
    },
  ],
}
