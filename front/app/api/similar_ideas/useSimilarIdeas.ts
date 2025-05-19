import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IIdeas } from 'api/ideas/types';

import fetcher from 'utils/cl-react-query/fetcher';

import similarIdeasKeys from './keys';
import { ISimilarityRequestPayload } from './types';

const fetchSimilarIdeas = (ideaPayload: ISimilarityRequestPayload) =>
  fetcher<IIdeas>({
    path: `/ideas/similar_ideas`,
    action: 'post',
    body: ideaPayload,
  });

const useSimilarIdeas = (
  ideaPayload: ISimilarityRequestPayload,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<IIdeas, CLErrors>({
    queryKey: similarIdeasKeys.list(ideaPayload),
    queryFn: () => fetchSimilarIdeas(ideaPayload),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
    keepPreviousData: false,
  });
};

export default useSimilarIdeas;
