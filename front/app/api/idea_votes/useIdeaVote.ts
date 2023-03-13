import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import voteKeys from './keys';
import { IdeaVotesKeys, IIdeaVote } from './types';

const fetchVote = (id?: string) =>
  fetcher<IIdeaVote>({
    path: `/votes/${id}`,
    action: 'get',
  });

const useIdeaVote = (id?: string) => {
  return useQuery<IIdeaVote, CLErrors, IIdeaVote, IdeaVotesKeys>({
    queryKey: voteKeys.item(id),
    queryFn: () => fetchVote(id),
    enabled: !!id,
  });
};

export default useIdeaVote;
