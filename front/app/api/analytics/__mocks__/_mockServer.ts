import { PathParams, RestRequest, rest } from 'msw';
import { API_PATH } from 'containers/App/constants';
import responses from './responses';

const apiPath = `${API_PATH}/analytics`;

const findResponse = (req: RestRequest<never, PathParams<string>>) => {
  const params = new URL(req.url.toString()).search;

  return responses[params];
};

const endpoints = {
  'GET analytics': rest.get(apiPath, (req, res, ctx) => {
    const response = findResponse(req);

    if (!response) {
      return res(ctx.status(404));
    }

    return res(ctx.status(200), ctx.json({ data: response }));
  }),
};

export default endpoints;
