import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import taggingKeys from './keys';
import tagsKeys from 'api/analysis_tags/keys';

const deleteTagging = ({
  analysisId,
  id,
}: {
  analysisId: string;
  id: string;
}) =>
  fetcher({
    path: `/analyses/${analysisId}/taggings/${id}`,
    action: 'delete',
  });

const useDeleteAnalysisTagging = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTagging,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taggingKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: tagsKeys.lists(),
      });
    },
  });
};

export default useDeleteAnalysisTagging;
