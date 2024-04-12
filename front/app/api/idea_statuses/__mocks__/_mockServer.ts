import { rest } from 'msw';

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
    },
  },
];

export const apiPathStatus = '/web_api/v1/idea_statuses/:id';
export const apiPathStatuses = '/web_api/v1/idea_statuses';

const endpoints = {
  'GET idea_statuses/:id': rest.get(apiPathStatus, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaStatusesData[0] }));
  }),
  'GET idea_statuses': rest.get(apiPathStatuses, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaStatusesData }));
  }),
};

export default endpoints;
