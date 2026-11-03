import {
  keepPreviousData as keepPreviousDataFn,
  useInfiniteQuery,
  InfiniteData,
} from '@tanstack/react-query';
import { uniqBy } from 'lodash-es';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { NO_PLACEHOLDER_DATA } from 'utils/cl-react-query/queryClient';

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
    InfiniteData<IIdeaFeedIdeas>,
    IdeaFeedKeys,
    boolean
  >({
    queryKey: ideaFeedKeys.list({ phaseId, ...queryParams }),
    queryFn: () =>
      fetchIdeaFeedIdeas({
        phaseId,
        pageSize: queryParams['page[size]'],
        topic: queryParams.topic,
      }),
    initialPageParam: true,
    getNextPageParam: (_lastPage, allPages) => {
      // Check if the last page added any new unique ideas
      const allIdeas = allPages.flatMap((page) => page.data);
      const uniqueIdeas = uniqBy(allIdeas, 'id');

      // If no new unique ideas were added by the last page, we've reached the end
      if (allPages.length > 1) {
        const previousPages = allPages.slice(0, -1);
        const previousIdeas = previousPages.flatMap((page) => page.data);
        const previousUniqueCount = uniqBy(previousIdeas, 'id').length;

        if (uniqueIdeas.length === previousUniqueCount) {
          return undefined; // No more pages
        }
      }

      return true;
    },
    placeholderData: keepPreviousData
      ? keepPreviousDataFn
      : NO_PLACEHOLDER_DATA,
    gcTime: 0,
  });
};

export default useInfiniteIdeaFeedIdeas;
