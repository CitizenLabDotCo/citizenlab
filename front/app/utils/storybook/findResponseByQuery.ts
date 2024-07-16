export const findResponseByQuery = <Responses extends Record<string, any>>(
  req: any,
  responses: Responses
): Responses[keyof Responses] | undefined => {
  const params = new URL(req.url.toString()).search;

  return responses[params];
};
