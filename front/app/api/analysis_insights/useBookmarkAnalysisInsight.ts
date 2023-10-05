import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import insightsKeys from './keys';

const bookmarkInsight = ({
  analysisId,
  id,
}: {
  analysisId: string;
  id: string;
}) =>
  fetcher({
    path: `/analyses/${analysisId}/insights/${id}/toggle_bookmark`,
    action: 'post',
    body: null,
  });

const useToggleInsightBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookmarkInsight,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: insightsKeys.lists(),
      });
    },
  });
};

export default useToggleInsightBookmark;
