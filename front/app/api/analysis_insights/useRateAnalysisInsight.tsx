import { useMutation } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';

const rateInsight = ({
  analysisId,
  id,
  rating,
}: {
  analysisId: string;
  id: string;
  rating: 'vote_up' | 'vote_down';
}) =>
  fetcher({
    path: `/analyses/${analysisId}/insights/${id}/rate`,
    action: 'post',
    body: {
      rating,
    },
  });

const useRateAnalysisInsight = () => {
  return useMutation({
    mutationFn: rateInsight,
  });
};

export default useRateAnalysisInsight;
