import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import basketKeys from './keys';
import { IBasket, INewBasket } from './types';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';

const addBasket = async (requestBody: INewBasket) =>
  fetcher<IBasket>({
    path: '/baskets',
    action: 'post',
    body: { basket: requestBody },
  });

const useAddBasket = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasket, CLErrors, INewBasket>({
    mutationFn: addBasket,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: basketKeys.items() });
      if (variables.participation_context_type === 'Project') {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({
            id: variables.participation_context_id,
          }),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({
            phaseId: variables.participation_context_id,
          }),
        });
      }
    },
  });
};

export default useAddBasket;
