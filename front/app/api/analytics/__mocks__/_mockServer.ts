import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { findResponseByQuery } from 'utils/storybook/findResponseByQuery';

import responses from './responses';

const apiPath = `${API_PATH}/analytics`;

const endpoints = {
  'GET analytics': http.get(apiPath, ({ request }) => {
    const response = findResponseByQuery(request, responses);

    if (!response) {
      return HttpResponse.json(null, { status: 404 });
    }

    return HttpResponse.json(response, { status: 200 });
  }),
};

export default endpoints;
