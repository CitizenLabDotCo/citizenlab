import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reactionKeys from './keys';
import { IdeaReactionsKeys, IIdeaReaction } from './types';

const fetchReaction = ({ id }: { id?: string }) =>
  fetcher<IIdeaReaction>({
    path: `/reactions/${id}`,
    action: 'get',
  });

const useIdeaReaction = (id?: string) => {
  return useQuery<IIdeaReaction, CLErrors, IIdeaReaction, IdeaReactionsKeys>({
    queryKey: reactionKeys.item({ id }),
    queryFn: () => fetchReaction({ id }),
    enabled: !!id,
  });
};

export default useIdeaReaction;
