import { IBasket } from 'api/baskets/types';
import { IBasketsIdeas } from 'api/baskets_ideas/types';
import { IdeaVotingDisabledReason } from 'api/ideas/types';

import {
  ActionDescriptorFutureEnabled,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';

export const isButtonEnabled = (
  basket: IBasket | undefined,
  actionDescriptor: ActionDescriptorFutureEnabled<IdeaVotingDisabledReason>
) => {
  const actionDisabledAndNotFixable =
    actionDescriptor.enabled === false &&
    !isFixableByAuthentication(actionDescriptor.disabled_reason);

  if (actionDisabledAndNotFixable) return false;

  if (basket === undefined) {
    return true;
  }

  const basketNotSubmittedYet = !basket.data.attributes.submitted_at;
  return basketNotSubmittedYet;
};

export const isIdeaInBasket = (
  ideaId: string,
  basketsIdeas?: IBasketsIdeas
) => {
  if (!basketsIdeas) return false;

  for (const basketsIdea of basketsIdeas.data) {
    if (basketsIdea.relationships.idea.data.id === ideaId) return true;
  }

  return false;
};
