import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhase, SetupReviewCard } from './types';

const useReviewSetupCard = (phaseId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (card: SetupReviewCard) =>
      fetcher<IPhase>({
        path: `/phases/${phaseId}/review_setup_card`,
        action: 'post',
        body: { card },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phasesKeys.item({ phaseId }) });
      queryClient.invalidateQueries({ queryKey: phasesKeys.lists() });
    },
  });
};

export default useReviewSetupCard;
