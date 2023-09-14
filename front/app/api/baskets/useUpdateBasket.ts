import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import basketKeys from './keys';
import { IBasket, IUpdateBasket } from './types';
import phasesKeys from 'api/phases/keys';
import projectsKeys from 'api/projects/keys';
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
  return useMutation<
    IBasket,
    CLErrors,
    UpdateBasket & { participation_context_type: 'Project' | 'Phase' }
  >({
    mutationFn: updateBasket,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: basketKeys.items() });
      queryClient.invalidateQueries({
        queryKey: basketsIdeasKeys.item({ basketId: variables.id }),
      });
      const contextId = data.data.relationships.participation_context.data.id;
      if (variables.participation_context_type === 'Project') {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({
            id: contextId,
          }),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({ phaseId: contextId }),
        });
      }
    },
  });
};

export default useUpdateBasket;
