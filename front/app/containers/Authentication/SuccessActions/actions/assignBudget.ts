// api
import { fetchIdea } from 'api/ideas/useIdeaById';
import { fetchProjectById } from 'api/projects/useProjectById';
import { fetchPhase } from 'api/phases/usePhase';
import { fetchBasket } from 'api/baskets/useBasket';
import { addIdeaToBasket } from 'api/baskets/useAddIdeaToBasket';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/AddToBasketButton/tracks';

// utils
import { isNil, capitalizeParticipationContextType } from 'utils/helperUtils';
import streams from 'utils/streams';
import { queryClient } from 'utils/cl-react-query/queryClient';

// typings
import { IParticipationContextType } from 'typings';

export interface AssignBudgetParams {
  ideaId: string;
  participationContextId: string;
  participationContextType: 'project' | 'phase';
}

export const assignBudget =
  ({
    ideaId,
    participationContextId,
    participationContextType,
  }: AssignBudgetParams) =>
  async () => {
    const ideaPromise = fetchIdea({ id: ideaId });

    const participationContextPromise =
      participationContextType === 'project'
        ? fetchProjectById({ id: participationContextId })
        : fetchPhase({ phaseId: participationContextId });
  };
