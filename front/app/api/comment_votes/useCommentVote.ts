import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import voteKeys from './keys';
import { CommentVotesKeys, ICommentVote } from './types';

const fetchVote = ({ id }: { id?: string }) =>
  fetcher<ICommentVote>({
    path: `/votes/${id}`,
    action: 'get',
  });

const useCommentVote = (id?: string) => {
  return useQuery<ICommentVote, CLErrors, ICommentVote, CommentVotesKeys>({
    queryKey: voteKeys.item({ id }),
    queryFn: async () => await fetchVote({ id }),
    enabled: !!id,
    keepPreviousData: false,
  });
};

export default useCommentVote;
