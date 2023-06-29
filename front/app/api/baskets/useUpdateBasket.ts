import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import basketKeys from './keys';
import { IBasket, IUpdateBasket } from './types';
import phasesKeys from 'api/phases/keys';
import projectsKeys from 'api/projects/keys';

type UpdateBasket = Partial<IUpdateBasket> & { id: string };

export const updateBasket = ({ id, ...requestBody }: UpdateBasket) =>
  fetcher<IBasket>({
    path: `/baskets/${id}`,
    action: 'patch',
    body: { basket: requestBody },
  });

const useUpdateBasket = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasket, CLErrors, UpdateBasket>({
    mutationFn: updateBasket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: basketKeys.items() });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.item({
          phaseId: data.data.relationships.participation_context.data.id,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({
          id: data.data.relationships.participation_context.data.id,
        }),
      });
    },
  });
};

export default useUpdateBasket;
