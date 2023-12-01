import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import basketKeys from './keys';
import { IBasket, IUpdateBasket } from './types';
import phasesKeys from 'api/phases/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';

type UpdateBasket = Partial<IUpdateBasket> & {
  id: string;
};

export const updateBasket = ({ id, submitted }: UpdateBasket) =>
  fetcher<IBasket>({
    path: `/baskets/${id}`,
    action: 'patch',
    body: { basket: { submitted } },
  });

const useUpdateBasket = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasket, CLErrors, UpdateBasket>({
    mutationFn: updateBasket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: basketKeys.items() });
      queryClient.invalidateQueries({
        queryKey: basketsIdeasKeys.item({ basketId: variables.id }),
      });
      const phaseId = data.data.relationships.phase.data.id;
      queryClient.invalidateQueries({
        queryKey: phasesKeys.item({ phaseId }),
      });
    },
  });
};

export default useUpdateBasket;
