import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    },
  });
};

export default useDeleteInitiative;
