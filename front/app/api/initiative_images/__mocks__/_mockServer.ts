import { http, HttpResponse } from 'msw';

import { getOrigin } from 'utils/storybook/getOrigin';

import { IInitiativeImageData } from '../types';

const image = `${getOrigin()}/images/image16.png`;

export const initiativeImagesData: IInitiativeImageData[] = [
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

export const apiPath = '*initiatives/:initiativeId/images/:imageId';

const endpoints = {
  'GET initiatives/:initiativeId/images/:imageId': http.get(apiPath, () => {
    return HttpResponse.json(
      { data: initiativeImagesData[0] },
      { status: 200 }
    );
  }),
};

export default endpoints;
