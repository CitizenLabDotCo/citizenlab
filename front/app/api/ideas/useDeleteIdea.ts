import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';

const deleteIdea = (id: string) =>
  fetcher({
    path: `/ideas/${id}`,
    action: 'delete',
  });

const useDeleteIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ideasKeys.lists(),
      });
    },
  });
};

export default useDeleteIdea;
