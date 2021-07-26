const PARAM_KEY = '?scrollTo=';

export const isScrollToQuery = (queryParam?: string) =>
  queryParam && queryParam.startsWith(PARAM_KEY);

export const parseScrollToQuery = (queryParam: string) =>
  queryParam.slice(PARAM_KEY.length, queryParam.length);
