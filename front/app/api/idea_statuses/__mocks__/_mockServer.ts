import { http, HttpResponse } from 'msw';

import { IIdeaStatusData } from '../types';

export const ideaStatusesData: IIdeaStatusData[] = [
  {
    id: '1',
    type: 'idea_status',
    attributes: {
      code: 'proposed',
      title_multiloc: {
        en: 'Idea status 1',
      },
      description_multiloc: {
        en: 'Description of idea status 1',
      },
      color: '#FF0000',
      ordering: 1,
      can_reorder: false,
      can_transition_manually: true,
    },
  },
  {
    id: '2',
    type: 'idea_status',
    attributes: {
      code: 'under_consideration',
      title_multiloc: {
        en: 'Idea status 2',
      },
      description_multiloc: {
        en: 'Description of idea status 2',
      },
      color: '#00FF00',
      ordering: 2,
      can_reorder: true,
      can_transition_manually: true,
    },
  },
];

export const apiPathStatus = '/web_api/v1/idea_statuses/:id';
export const apiPathStatuses = '/web_api/v1/idea_statuses';

const endpoints = {
  'GET idea_statuses/:id': http.get(apiPathStatus, () => {
    return HttpResponse.json({ data: ideaStatusesData[0] }, { status: 200 });
  }),
  'GET idea_statuses': http.get(apiPathStatuses, () => {
    return HttpResponse.json({ data: ideaStatusesData }, { status: 200 });
  }),
};

export default endpoints;
