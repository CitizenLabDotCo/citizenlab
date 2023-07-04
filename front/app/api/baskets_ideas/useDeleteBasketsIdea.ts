import { useQueryClient, useMutation } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBasketsIdea, IDeleteBasketsIdea } from './types';
import { CLErrors } from 'typings';
import basketsIdeasKeys from './keys';
import basketsKeys from 'api/baskets/keys';

export const deleteBasketsIdea = async (requestBody: IDeleteBasketsIdea) =>
  fetcher<IBasketsIdea>({
    path: `/baskets_ideas/${requestBody.basketIdeaId}`,
    action: 'delete',
  });

const useDeleteBasketsIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasketsIdea, CLErrors, IDeleteBasketsIdea>({
    mutationFn: deleteBasketsIdea,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: basketsIdeasKeys.items() });
      queryClient.invalidateQueries({
        queryKey: basketsKeys.item({ id: variables.basketId }),
      });
    },
  });
};

export default useDeleteBasketsIdea;
