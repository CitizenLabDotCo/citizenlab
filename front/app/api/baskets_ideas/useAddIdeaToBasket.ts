import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBasketsIdea } from './types';
import basketsKeys from '../baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';

interface Params {
  idea_id: string;
  votes: number | null;
}

export const addIdeaToBasket = async (params: Params) =>
  fetcher<IBasketsIdea>({
    path: `/baskets/ideas/${params.idea_id}`,
    action: 'put',
    body: { baskets_idea: params },
  });

const useAddIdeaToBasket = () => {
  const queryClient = useQueryClient();

  return useMutation<IBasketsIdea, CLErrors, Params>({
    mutationFn: addIdeaToBasket,
    onSuccess: (data) => {
      const basketId = data.data.relationships.basket.data.id;

      queryClient.invalidateQueries({
        queryKey: basketsKeys.item({ id: basketId }),
      });
      queryClient.invalidateQueries({
        queryKey: basketsIdeasKeys.item({ basketId }),
      });
    },
  });
};

export default useAddIdeaToBasket;
