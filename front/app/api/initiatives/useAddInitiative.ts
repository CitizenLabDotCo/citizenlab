import { useMutation, useQueryClient } from '@tanstack/react-query';
import initiativeFilterCountsKeys from 'api/initiatives_filter_counts/keys';
import initiativesCountKeys from 'api/initiative_counts/keys';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import { IInitiative, IInitiativeAdd } from './types';

const addInitiative = async (requestBody: IInitiativeAdd) =>
  fetcher<IInitiative>({
    path: `/initiatives`,
    action: 'post',
    body: requestBody,
  });

const useAddInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiative, CLErrors, IInitiativeAdd>({
    mutationFn: addInitiative,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativesCountKeys.items(),
      }),
        queryClient.invalidateQueries({
          queryKey: initiativeFilterCountsKeys.items(),
        });
    },
  });
};

export default useAddInitiative;
