import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhase, SetupReviewCard } from './types';

interface ReviewSetupCard {
  phaseId: string;
  card: SetupReviewCard;
}

const useReviewSetupCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phaseId, card }: ReviewSetupCard) =>
      fetcher<IPhase>({
        path: `/phases/${phaseId}/review_setup_card`,
        action: 'post',
        body: { card },
      }),
    onSuccess: (_phase, { phaseId }) => {
      queryClient.invalidateQueries({ queryKey: phasesKeys.item({ phaseId }) });
      queryClient.invalidateQueries({ queryKey: phasesKeys.lists() });
    },
  });
};

export default useReviewSetupCard;
