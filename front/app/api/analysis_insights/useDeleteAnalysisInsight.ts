import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import insightsKeys from './keys';

const deleteInsight = ({
  analysisId,
  id,
}: {
  analysisId: string;
  id: string;
}) =>
  fetcher({
    path: `/analyses/${analysisId}/insights/${id}`,
    action: 'delete',
  });

const useDeleteAnalysisInsight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInsight,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: insightsKeys.lists(),
      });
    },
  });
};

export default useDeleteAnalysisInsight;
