import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import analysisKeys from './keys';

const deleteAnalysis = (id: string) =>
  fetcher({
    path: `/analyses/${id}`,
    action: 'delete',
  });

const useDeleteAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analysisKeys.lists(),
      });
    },
  });
};

export default useDeleteAnalysis;
