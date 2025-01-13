import { addDays, format } from 'date-fns';
import { http, HttpResponse } from 'msw';

import { PhaseMini } from '../types';

export const apiPathPhaseMini = '/web_api/v1/phases/:id/mini';

const miniPhaseData: PhaseMini['data'] = {
  id: 'MockPhaseInformationId',
  type: 'phase_mini',
  attributes: {
    end_at: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
    participation_method: 'ideation',
    input_term: 'idea',
  },
  relationships: {
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      },
    },
  },
};

const endpoints = {
  'GET phases/:id/mini': http.get(apiPathPhaseMini, () => {
    return HttpResponse.json({ data: miniPhaseData }, { status: 200 });
  }),
};

export default endpoints;
