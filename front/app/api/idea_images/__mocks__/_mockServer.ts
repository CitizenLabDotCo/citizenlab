import { http, HttpResponse } from 'msw';

import { getOrigin } from 'utils/storybook/getOrigin';

import { IIdeaImageData } from '../types';

const image = `${getOrigin()}/images/image16.png`;

export const ideaImagesData: IIdeaImageData[] = [
  {
    id: '30c1b604-71fd-4ac4-9cd7-3e5601d9cb0f',
    type: 'image',
    attributes: {
      ordering: 0,
      created_at: '2023-02-28T05:56:37.762Z',
      updated_at: '2023-02-28T05:56:37.762Z',
      versions: {
        small: image,
        medium: image,
        large: image,
        fb: image,
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
        small: image,
        medium: image,
        large: image,
        fb: image,
      },
    },
  },
];

export const apiPathImage = '/web_api/v1/ideas/:ideaId/images/:imageId';
export const apiPathImages = '/web_api/v1/ideas/:ideaId/images';

const endpoints = {
  'GET ideas/:ideaId/images/:imageId': http.get(apiPathImage, () => {
    return HttpResponse.json({ data: ideaImagesData[0] }, { status: 200 });
  }),
  'GET ideas/:ideaId/images': http.get(apiPathImages, () => {
    return HttpResponse.json({ data: ideaImagesData }, { status: 200 });
  }),
};

export default endpoints;
