import { http, HttpResponse } from 'msw';

import { IInitiativeStatusData } from '../types';

export const initiativeStatusesData: IInitiativeStatusData[] = [
  {
    id: '1',
    type: 'initiative_status',
    attributes: {
      code: 'proposed',
      title_multiloc: {
        en: 'Idea status 1',
      },
      description_multiloc: {
        en: 'Description of initiative status 1',
      },
      color: '#FF0000',
      ordering: 1,
      transition_type: 'automatic',
    },
  },
  {
    id: '2',
    type: 'initiative_status',
    attributes: {
      code: 'answered',
      title_multiloc: {
        en: 'Idea status 2',
      },
      description_multiloc: {
        en: 'Description of initiative status 2',
      },
      color: '#00FF00',
      ordering: 2,
      transition_type: 'manual',
    },
  },
];

export const apiPath = '/web_api/v1/initiative_statuses';

const endpoints = {
  'GET initiative_statuses': http.get(apiPath, () => {
    return HttpResponse.json({ data: initiativeStatusesData }, { status: 200 });
  }),
};

export default endpoints;
