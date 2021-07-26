const PARAM_KEY = '?scrollToEventId=';

export const isScrollToEventIdQuery = (queryParam?: string) =>
  queryParam && queryParam.startsWith(PARAM_KEY);

export const parseScrollToEventIdQuery = (queryParam: string) =>
  queryParam.slice(PARAM_KEY.length, queryParam.length);
