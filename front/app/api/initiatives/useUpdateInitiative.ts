import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import initiativesCountKeys from 'api/initiative_counts/keys';
import { IInitiative, IUpdateInitiativeObject } from './types';

const updateInitiative = ({
  initiativeId,
  requestBody,
}: IUpdateInitiativeObject) =>
  fetcher<IInitiative>({
    path: `/initiatives/${initiativeId}`,
    action: 'patch',
    body: { initiative: requestBody },
  });

const useUpdateInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiative, CLErrors, IUpdateInitiativeObject>({
    mutationFn: updateInitiative,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: initiativesCountKeys.all() });
    },
  });
};

export default useUpdateInitiative;
