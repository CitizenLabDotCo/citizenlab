import { useQueryClient, useMutation } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IAddBasketsIdea, IBasketsIdea } from './types';
import { CLErrors } from 'typings';
import basketsIdeasKeys from './keys';
import basketsKeys from 'api/baskets/keys';

export const addBasketsIdea = async (requestBody: IAddBasketsIdea) =>
  fetcher<IBasketsIdea>({
    path: `/baskets/${requestBody.basketId}/baskets_ideas`,
    action: 'post',
    body: {
      baskets_idea: {
        idea_id: requestBody.idea_id,
        votes: requestBody.votes,
      },
    },
  });

const useAddBasketsIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasketsIdea, CLErrors, IAddBasketsIdea>({
    mutationFn: addBasketsIdea,
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

export default useAddBasketsIdea;
