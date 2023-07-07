import { useQueryClient, useMutation } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBasketsIdea, IUpdateBasketsIdea } from './types';
import { CLErrors } from 'typings';
import basketsIdeasKeys from './keys';
import basketsKeys from 'api/baskets/keys';

export const updateBasketsIdea = async (requestBody: IUpdateBasketsIdea) =>
  fetcher<IBasketsIdea>({
    path: `/baskets_ideas/${requestBody.basketsIdeaId}`,
    action: 'patch',
    body: {
      baskets_idea: {
        votes: requestBody.votes,
      },
    },
  });

const useUpdateBasketsIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasketsIdea, CLErrors, IUpdateBasketsIdea>({
    mutationFn: updateBasketsIdea,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: basketsIdeasKeys.list({ basketId: variables.basketId }),
      });
      queryClient.invalidateQueries({
        queryKey: basketsKeys.item({ id: variables.basketId }),
      });
    },
  });
};

export default useUpdateBasketsIdea;
