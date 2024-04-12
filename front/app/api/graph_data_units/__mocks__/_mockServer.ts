import { rest } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { findResponseByQuery } from 'utils/storybook/findResponseByQuery';

import { liveResponses } from './responses';

const apiPath = `${API_PATH}/reports/graph_data_units/live`;

const endpoints = {
  'GET graph_data_units/live': rest.get(apiPath, (req, res, ctx) => {
    const response = findResponseByQuery(req, liveResponses);

    if (!response) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json(response));
  }),
};

export default endpoints;
