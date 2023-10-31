import { IIdeaImageData } from '../types';
import { rest } from 'msw';

export const ideaImagesData: IIdeaImageData[] = [
  {
    id: '30c1b604-71fd-4ac4-9cd7-3e5601d9cb0f',
    type: 'image',
    attributes: {
      ordering: 0,
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
      ordering: 1,
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

export const apiPathImage = '/web_api/v1/ideas/:ideaId/images/:imageId';
export const apiPathImages = '/web_api/v1/ideas/:ideaId/images';

const endpoints = {
  'GET ideas/:ideaId/images/:imageId': rest.get(
    apiPathImage,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: ideaImagesData[0] }));
    }
  ),
  'GET ideas/:ideaId/images': rest.get(apiPathImages, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaImagesData }));
  }),
};

export default endpoints;
