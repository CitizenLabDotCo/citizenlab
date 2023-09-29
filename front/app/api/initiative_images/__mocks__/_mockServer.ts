import { rest } from 'msw';

export const initiativeImagesData = [
  {
    id: '30c1b604-71fd-4ac4-9cd7-3e5601d9cb0f',
    type: 'image',
    attributes: {
      ordering: null,
      created_at: '2023-02-28T05:56:37.762Z',
      updated_at: '2023-02-28T05:56:37.762Z',
      versions: {
        small: 'http://localhost:6006/images/image16.png',
        medium: 'http://localhost:6006/images/image16.png',
        large: 'http://localhost:6006/images/image16.png',
        fb: 'http://localhost:6006/images/image16.png',
      },
    },
  },
  {
    id: '3y81b604-71fd-4ac4-9cd7-3e5601d989hj',
    type: 'image',
    attributes: {
      ordering: null,
      created_at: '2021-02-28T05:56:37.762Z',
      updated_at: '2020-02-28T05:56:37.762Z',
      versions: {
        small: 'http://localhost:6006/images/image16.png',
        medium: 'http://localhost:6006/images/image16.png',
        large: 'http://localhost:6006/images/image16.png',
        fb: 'http://localhost:6006/images/image16.png',
      },
    },
  },
];

export const apiPath = '*initiatives/:initiativeId/images/:imageId';

const endpoints = {
  'GET initiatives/:initiativeId/images/:imageId': rest.get(
    apiPath,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: initiativeImagesData[0] }));
    }
  ),
};

export default endpoints;
