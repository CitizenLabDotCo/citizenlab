import { http, HttpResponse } from 'msw';

import { IBasketData } from '../types';

export const basketData: IBasketData = {
  id: '1',
  type: 'basket',
  attributes: {
    submitted_at: '2020-10-01T10:00:00.000Z',
    total_votes: 1000,
  },
  relationships: {
    phase: {
      data: {
        id: '1',
        type: 'phase',
      },
    },
    user: {
      data: {
        id: '1',
        type: 'user',
      },
    },
    ideas: {
      data: [
        {
          id: '1',
          type: 'idea',
        },
        {
          id: '2',
          type: 'idea',
        },
      ],
    },
  },
};

export const apiPath = '/web_api/v1/baskets/:id';

const endpoints = {
  'GET baskets/:id': http.get(apiPath, () => {
    return HttpResponse.json({ data: basketData }, { status: 200 });
  }),
};

export default endpoints;
