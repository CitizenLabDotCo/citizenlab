import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import areasKeys from './keys';

const deleteArea = (id: string) =>
  fetcher({
    path: `/areas/${id}`,
    action: 'delete',
  });

const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: areasKeys.lists(),
      });
    },
  });
};

export default useDeleteArea;
