import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import ideaFeedKeys from './keys';
import {
  IIdeaFeedIdeas,
  IIdeaFeedQueryParameters,
  IdeaFeedKeys,
} from './types';

const defaultPageSize = 20;

const fetchIdeaFeedIdeas = ({
  phaseId,
  pageNumber,
  pageSize,
  topic,
}: {
  phaseId: string;
  pageNumber?: number;
  pageSize?: number;
  topic?: string;
}) =>
  fetcher<IIdeaFeedIdeas>({
    path: `/phases/${phaseId}/idea_feed/ideas`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      topics: topic ? [topic] : undefined,
    },
  });

const useInfiniteIdeaFeedIdeas = (
  params: IIdeaFeedQueryParameters & { phaseId: string }
) => {
  const { phaseId, ...queryParams } = params;
  return useInfiniteQuery<
    IIdeaFeedIdeas,
    CLErrors,
    IIdeaFeedIdeas,
    IdeaFeedKeys
  >({
    queryKey: ideaFeedKeys.list({ phaseId, ...queryParams }),
    queryFn: ({ pageParam }) =>
      fetchIdeaFeedIdeas({
        phaseId,
        pageNumber: pageParam,
        pageSize: queryParams['page[size]'],
        topic: queryParams.topic,
      }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    cacheTime: 0, // Disable cache to always have fresh data
  });
};

export default useInfiniteIdeaFeedIdeas;
