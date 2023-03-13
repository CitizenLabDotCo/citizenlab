import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import voteKeys from './keys';
import { VoteKeys, IIdeaVote } from './types';

const fetchVote = (id?: string) =>
  fetcher<IIdeaVote>({
    path: `/votes/${id}`,
    action: 'get',
  });

const useVote = (id?: string) => {
  return useQuery<IIdeaVote, CLErrors, IIdeaVote, VoteKeys>({
    queryKey: voteKeys.item(id),
    queryFn: () => fetchVote(id),
    enabled: !!id,
  });
};

export default useVote;
