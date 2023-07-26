import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import analysisKeys from './keys';

const deleteTag = ({ analysisId, id }: { analysisId: string; id: string }) =>
  fetcher({
    path: `/analyses/${analysisId}/tags/${id}`,
    action: 'delete',
  });

const useDeleteAnalysisTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: analysisKeys.lists(),
      });
    },
  });
};

export default useDeleteAnalysisTag;
