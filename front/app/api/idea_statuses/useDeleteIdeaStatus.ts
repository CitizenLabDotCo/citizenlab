import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaStatusesKeys from './keys';

const deleteIdeaStatus = (id: string) =>
  fetcher({
    path: `/idea_statuses/${id}`,
    action: 'delete',
  });

const useDeleteIdeaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdeaStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ideaStatusesKeys.lists(),
      });
    },
  });
};

export default useDeleteIdeaStatus;
