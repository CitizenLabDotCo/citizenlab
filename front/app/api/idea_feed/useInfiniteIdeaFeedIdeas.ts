import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaFeedKeys from './keys';
import {
  IIdeaFeedIdeas,
  IIdeaFeedQueryParameters,
  IdeaFeedKeys,
} from './types';

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
      'page[size]': pageSize,
      topics: topic ? [topic] : undefined,
    },
  });

const useIdeaFeedIdeas = (
  params: IIdeaFeedQueryParameters & { phaseId: string }
) => {
  const { phaseId, ...queryParams } = params;
  return useQuery<IIdeaFeedIdeas, CLErrors, IIdeaFeedIdeas, IdeaFeedKeys>({
    queryKey: ideaFeedKeys.list({ phaseId, ...queryParams }),
    queryFn: () =>
      fetchIdeaFeedIdeas({
        phaseId,
        pageSize: queryParams['page[size]'],
        topic: queryParams.topic,
      }),
  });
};

export default useIdeaFeedIdeas;
