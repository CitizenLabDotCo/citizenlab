import { useMutation, useQueryClient } from '@tanstack/react-query';
import initiativeFilterCountsKeys from 'api/initiatives_filter_counts/keys';
import initiativesCountKeys from 'api/initiative_counts/keys';
import initiativeMarkersKeys from 'api/initiative_markers/keys';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativesKeys from './keys';

const deleteInitiative = ({ initiativeId }: { initiativeId: string }) =>
  fetcher({
    path: `/initiatives/${initiativeId}`,
    action: 'delete',
  });

const useDeleteInitiative = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInitiative,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativesCountKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativeMarkersKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: initiativeFilterCountsKeys.all(),
      });
    },
  });
};

export default useDeleteInitiative;
