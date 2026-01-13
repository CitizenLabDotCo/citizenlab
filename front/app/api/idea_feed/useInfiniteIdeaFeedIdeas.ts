import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaFeedKeys from './keys';
import {
  IIdeaFeedIdeas,
  IIdeaFeedQueryParameters,
  IdeaFeedKeys,
} from './types';

const defaultPageSize = 20;

const fetchIdeaFeedIdeas = ({
  phaseId,
  pageSize,
  topic,
}: {
  phaseId: string;
  pageSize?: number;
  topic?: string;
}) =>
  fetcher<IIdeaFeedIdeas>({
    path: `/phases/${phaseId}/idea_feed/ideas`,
    action: 'get',
    queryParams: {
      'page[size]': pageSize || defaultPageSize,
      topics: topic ? [topic] : undefined,
    },
  });

const useInfiniteIdeaFeedIdeas = (
  params: IIdeaFeedQueryParameters & {
    phaseId: string;
    keepPreviousData?: boolean;
  }
) => {
  const { phaseId, keepPreviousData, ...queryParams } = params;
  return useInfiniteQuery<
    IIdeaFeedIdeas,
    CLErrors,
    IIdeaFeedIdeas,
    IdeaFeedKeys
  >({
    queryKey: ideaFeedKeys.list({ phaseId, ...queryParams }),
    queryFn: () =>
      fetchIdeaFeedIdeas({
        phaseId,
        pageSize: queryParams['page[size]'],
        topic: queryParams.topic,
      }),
    getNextPageParam: () => true,
    keepPreviousData,
    cacheTime: 0,
  });
};

export default useInfiniteIdeaFeedIdeas;
