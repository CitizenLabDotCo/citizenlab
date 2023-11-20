import { rest } from 'msw';
import { API_PATH } from 'containers/App/constants';
import { findResponseByQuery } from 'utils/storybook/findResponseByQuery';

const reactionsByTimeLive = {
  params: '',
  response: {},
};

const liveResponses = {
  [reactionsByTimeLive.params]: reactionsByTimeLive.response,
};

const apiPath = `${API_PATH}/reports/graph_data_units/live`;

const endpoints = {
  'GET analytics': rest.get(apiPath, (req, res, ctx) => {
    const response = findResponseByQuery(req, liveResponses);

    if (!response) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json(response));
  }),
};

export default endpoints;
