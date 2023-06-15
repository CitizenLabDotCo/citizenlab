import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reactionKeys from './keys';
import { CommentReactionsKeys, ICommentReaction } from './types';

const fetchReaction = ({ id }: { id?: string }) =>
  fetcher<ICommentReaction>({
    path: `/reactions/${id}`,
    action: 'get',
  });

const useCommentReaction = (id?: string) => {
  return useQuery<
    ICommentReaction,
    CLErrors,
    ICommentReaction,
    CommentReactionsKeys
  >({
    queryKey: reactionKeys.item({ id }),
    queryFn: async () => await fetchReaction({ id }),
    enabled: !!id,
    keepPreviousData: false,
  });
};

export default useCommentReaction;
