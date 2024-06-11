import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { findResponseByQuery } from 'utils/storybook/findResponseByQuery';

import { liveResponses } from './responses';

const apiPath = `${API_PATH}/reports/graph_data_units/live`;

const endpoints = {
  'GET graph_data_units/live': http.get(apiPath, ({ request }) => {
    const response = findResponseByQuery(request, liveResponses);

    if (!response) {
      return HttpResponse.json(null, { status: 404 });
    }

    return HttpResponse.json(response, { status: 200 });
  }),
};

export default endpoints;
