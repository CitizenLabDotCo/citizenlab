const QUERY_NAME = 'scrollToEventId';

export default function getScrollToEventId(
  query: Record<string, any>,
  urlSegments: string[]
) {
  if (query[QUERY_NAME]) return query[QUERY_NAME];
  // Sometimes, query[QUERY_NAME] is undefined for some weird reason.
  // In this case, the query is taken from the URL.

  const lastSegment = urlSegments[urlSegments.length - 1];
  if (containsQuery(lastSegment)) return getQueryValue(lastSegment);
}

const containsQuery = (urlSegment: string) => {
  return urlSegment.includes(`?${QUERY_NAME}=`);
};

const getQueryValue = (urlSegment: string) => {
  return urlSegment.split(`?${QUERY_NAME}=`)[1];
};
