import { IIdeaData } from 'api/ideas/types';
import { ParticipationMethod } from 'api/phases/types';

import { isFixableByAuthentication } from 'utils/actionDescriptors';

export const showIdeationReactions = (
  idea: IIdeaData,
  participationMethod: ParticipationMethod
) => {
  if (participationMethod !== 'ideation') {
    return false;
  }

  const reactingActionDescriptor =
    idea.attributes.action_descriptors.reacting_idea;
  const reactingFutureEnabled = !!(
    reactingActionDescriptor.up.future_enabled_at ||
    reactingActionDescriptor.down.future_enabled_at
  );
  const cancellingEnabled = reactingActionDescriptor.cancelling_enabled;
  const likesCount = idea.attributes.likes_count;
  const dislikesCount = idea.attributes.dislikes_count;
  return (
    reactingActionDescriptor.enabled ||
    isFixableByAuthentication(reactingActionDescriptor.disabled_reason) ||
    cancellingEnabled ||
    reactingFutureEnabled ||
    likesCount > 0 ||
    dislikesCount > 0
  );
};

export const showProposalsReactions = (
  idea: IIdeaData,
  participationMethod: ParticipationMethod
) => {
  if (participationMethod !== 'proposals') {
    return false;
  }

  const reactingActionDescriptor =
    idea.attributes.action_descriptors.reacting_idea;

  return (
    // BE disables reactions for ideas in certain statuses
    reactingActionDescriptor.enabled ||
    isFixableByAuthentication(reactingActionDescriptor.disabled_reason)
  );
};
