import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';
import initiativesCountKeys from 'api/initiative_counts/keys';
import { IInitiative, IUpdateInitiativeObject } from './types';
import initiativeMarkersKeys from 'api/initiative_markers/keys';
import initiativeFilterCountsKeys from 'api/initiatives_filter_counts/keys';

const updateInitiative = ({
  initiativeId,
  requestBody,
}: IUpdateInitiativeObject) => {
  return fetcher<IInitiative>({
    path: `/initiatives/${initiativeId}`,
    action: 'patch',
    body: { initiative: requestBody },
  });
};

const useUpdateInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiative, CLErrors, IUpdateInitiativeObject>({
    mutationFn: updateInitiative,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativeMarkersKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativeFilterCountsKeys.all(),
      });
      queryClient.invalidateQueries({ queryKey: initiativesCountKeys.all() });
    },
  });
};

export default useUpdateInitiative;
