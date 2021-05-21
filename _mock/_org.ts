import { MockRequest } from '@knz/mock'

function getpagelist(req) {
  return {
    result: {
      code: 0,
      message: 'SUCCESS',
    },
    data: [
      {
        id: '1394113918594453506',
        createTime: '2021-05-18T15:02:41.614+08:00',
        updateTime: '2021-05-17T10:50:30.541+08:00',
        createBy: '1384782494162751489',
        lastUpdateBy: '1384782494162751489',
        isDeleted: false,
        code: 'ZZBM017-1',
        name: '父愁者联盟1mock',
        type: '1300713386325053441',
        region: '压力撒白scale',
        status: 'ENABLE',
        isRoot: false,
        effectiveDate: '2021-05-17 10:50:09',
        organizationDimensionId: 'DEFAULT_DIMENSION',
        isInChangePlan: false,
        superior: {
          id: '1376773253191700481',
          createTime: '2021-05-18T15:02:41.614+08:00',
          updateTime: '2021-05-07T11:38:36.350+08:00',
          createBy: '1384777321554120706',
          lastUpdateBy: '1384690827262955521',
          isDeleted: false,
          code: 'DEV01',
          name: '研发1部',
          type: '1300713386325053441',
          region: '341请问',
          status: 'ENABLE',
          description: '',
          isRoot: false,
          effectiveDate: '2021-05-08 11:38:28',
          organizationDimensionId: 'DEFAULT_DIMENSION',
          childId: '1394113918594453506',
          isInChangePlan: false,
        },
        positionNum: 2,
        employeeNum: 0,
      },
      {
        id: '1394195078427185154',
        createTime: '2021-05-18T15:02:41.614+08:00',
        updateTime: '2021-05-17T15:36:24.247+08:00',
        createBy: '1384690827262955521',
        lastUpdateBy: '1384690827262955521',
        isDeleted: false,
        code: 'dearzz',
        name: 'dearzz',
        type: '1300713302678048770',
        region: 'xxxx',
        status: 'ENABLE',
        description: '',
        isRoot: false,
        effectiveDate: '2021-05-17 15:36:24',
        organizationDimensionId: 'DEFAULT_DIMENSION',
        isInChangePlan: false,
        superior: {
          id: '1394113918594453506',
          createTime: '2021-05-18T15:02:41.614+08:00',
          updateTime: '2021-05-17T10:50:30.541+08:00',
          createBy: '1384782494162751489',
          lastUpdateBy: '1384782494162751489',
          isDeleted: false,
          code: 'ZZBM017-1',
          name: '父愁者联盟',
          type: '1300713386325053441',
          region: '压力撒白scale',
          status: 'ENABLE',
          isRoot: false,
          effectiveDate: '2021-05-17 10:50:09',
          organizationDimensionId: 'DEFAULT_DIMENSION',
          childId: '1394195078427185154',
          isInChangePlan: false,
        },
        positionNum: 0,
        employeeNum: 0,
      },
    ],
    page: {
      total: 2,
      pages: 1,
      size: 20,
      current: 1,
    },
  }
}

export const org = {
  'POST /vx/organization/listByPage': (req: MockRequest) => getpagelist(req),
}