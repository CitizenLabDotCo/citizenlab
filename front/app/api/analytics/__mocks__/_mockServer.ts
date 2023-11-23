import { rest } from 'msw';
import { API_PATH } from 'containers/App/constants';
import responses from './responses';
import { findResponseByQuery } from 'utils/storybook/findResponseByQuery';

const apiPath = `${API_PATH}/analytics`;

const endpoints = {
  'GET analytics': rest.get(apiPath, (req, res, ctx) => {
    const response = findResponseByQuery(req, responses);

    if (!response) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json(response));
  }),
};

export default endpoints;
