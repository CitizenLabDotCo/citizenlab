import { createContext, useContext } from 'react';

import { SetupReviewCard } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useReviewSetupCard from 'api/phases/useReviewSetupCard';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { useParams } from 'utils/router';

export const DraftSetupReviewContext = createContext<{
  reviewed: SetupReviewCard[];
  onReview: (card: SetupReviewCard) => void;
} | null>(null);

export const useSetupReview = (card: SetupReviewCard | undefined) => {
  const redesign = useProjectBackofficeRedesign();
  const enabled = redesign && !!card;
  const draft = useContext(DraftSetupReviewContext);
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(enabled && !draft ? phaseId : undefined);
  const { mutate, isPending, isError } = useReviewSetupCard(phaseId);
  const reviewed = (
    draft?.reviewed ??
    phase?.data.attributes.reviewed_setup_cards ??
    []
  ).some((reviewedCard) => reviewedCard === card);

  return {
    enabled: enabled && (!!draft || !!phase),
    reviewed,
    isError,
    onReview: () => {
      if (!enabled || reviewed || isPending) return;
      if (draft) {
        draft.onReview(card);
      } else if (phase) {
        mutate(card);
      }
    },
  };
};
