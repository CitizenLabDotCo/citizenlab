import { API_PATH } from 'containers/App/constants';
import { rest } from 'msw';
import { Report } from '../types';

export const apiPathReport = `${API_PATH}/reports/:id`;
export const apiPathReports = `${API_PATH}/reports`;

const endpoints = {
  'GET reports/:id': rest.get(apiPathReport, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: reportsData[0] }));
  }),
  'GET reports': rest.get(apiPathReports, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: reportsData }));
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
      action_descriptor: {
        editing_report: {
          enabled: true,
          disabled_reason: null,
        },
      },
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
      action_descriptor: {
        editing_report: {
          enabled: true,
          disabled_reason: null,
        },
      },
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
