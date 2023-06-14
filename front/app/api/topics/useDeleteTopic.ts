import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import topicsKeys from './keys';

const deleteTopic = (id: string) =>
  fetcher({
    path: `/topics/${id}`,
    action: 'delete',
  });

const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: topicsKeys.lists(),
      });
    },
  });
};

export default useDeleteTopic;
