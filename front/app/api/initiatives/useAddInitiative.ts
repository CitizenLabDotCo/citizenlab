import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    },
  });
};

export default useAddInitiative;
