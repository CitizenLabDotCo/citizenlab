import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { Report } from '../types';

export const apiPathReport = `${API_PATH}/reports/:id`;
export const apiPathReports = `${API_PATH}/reports`;

const endpoints = {
  'GET reports/:id': http.get(apiPathReport, () => {
    return HttpResponse.json({ data: reportsData[0] }, { status: 200 });
  }),
  'GET reports': http.get(apiPathReports, () => {
    return HttpResponse.json({ data: reportsData }, { status: 200 });
  }),
};

export default endpoints;

export const reportsData: Report[] = [
  {
    id: '1',
    type: 'report',
    attributes: {
      name: 'Report 1',
      created_at: '2020-10-20T09:00:00.000Z',
      updated_at: '2020-10-20T09:00:00.000Z',
      action_descriptors: {
        editing_report: {
          enabled: true,
          disabled_reason: null,
        },
      },
      visible: false,
    },
    relationships: {
      layout: {
        data: {
          id: 'layoutId',
          type: 'content-builder-layout',
        },
      },
      owner: {
        data: {
          id: 'userId',
          type: 'user',
        },
      },
    },
  },
  {
    id: '2',
    type: 'report',
    attributes: {
      name: 'Report 1',
      created_at: '2020-10-20T09:00:00.000Z',
      updated_at: '2020-10-20T09:00:00.000Z',
      action_descriptors: {
        editing_report: {
          enabled: true,
          disabled_reason: null,
        },
      },
      visible: false,
    },
    relationships: {
      layout: {
        data: {
          id: 'layoutId',
          type: 'content-builder-layout',
        },
      },
      owner: {
        data: {
          id: 'userId',
          type: 'user',
        },
      },
    },
  },
];
