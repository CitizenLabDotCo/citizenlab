import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import summariesKeys from './keys';

const deleteSummary = ({
  analysisId,
  id,
}: {
  analysisId: string;
  id: string;
}) =>
  fetcher({
    path: `/analyses/${analysisId}/summaries/${id}`,
    action: 'delete',
  });

const useDeleteAnalysisSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: summariesKeys.lists(),
      });
    },
  });
};

export default useDeleteAnalysisSummary;
