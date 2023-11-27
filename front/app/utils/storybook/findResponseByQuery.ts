import { PathParams, RestRequest } from 'msw';

export const findResponseByQuery = <Responses extends Record<string, any>>(
  req: RestRequest<never, PathParams<string>>,
  responses: Responses
): Responses[keyof Responses] | undefined => {
  const params = new URL(req.url.toString()).search;

  return responses[params];
};
