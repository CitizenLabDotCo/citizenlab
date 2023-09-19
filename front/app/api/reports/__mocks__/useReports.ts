import { Report } from '../types';

export const reportsData: Report[] = [
  {
    id: '1',
    type: 'report',
    attributes: {
      name: 'Report 1',
      created_at: '2020-10-20T09:00:00.000Z',
      updated_at: '2020-10-20T09:00:00.000Z',
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

export default jest.fn(() => {
  return { data: { data: reportsData } };
});
