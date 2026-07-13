import { IIdeaData } from 'api/ideas/types';

import { isFixableByAuthentication } from 'utils/actionDescriptors';

export const showIdeationReactions = (idea: IIdeaData) => {
  const reactingActionDescriptor =
    idea.attributes.action_descriptors.reacting_idea;
  const reactingFutureEnabled = !!(
    reactingActionDescriptor.up.future_enabled_at ||
    reactingActionDescriptor.down.future_enabled_at
  );
  const likesCount = idea.attributes.likes_count;
  const dislikesCount = idea.attributes.dislikes_count;
  const cancellingEnabled = reactingActionDescriptor.cancelling_enabled;
  // hide like/dislike buttons if Reacting to inputs is disabled
  // and idea is in active phase (disabled_reason equals reacting_disabled)
  if (!reactingActionDescriptor.enabled && reactingActionDescriptor .disabled_reason === 'reacting_disabled') {
    return null;
  }

  return (
    reactingActionDescriptor.enabled ||
    isFixableByAuthentication(reactingActionDescriptor.disabled_reason) ||
    cancellingEnabled ||
    reactingFutureEnabled ||
    likesCount > 0 ||
    dislikesCount > 0
  );
};

export const showProposalsReactions = (idea: IIdeaData) => {
  const reactingActionDescriptor =
    idea.attributes.action_descriptors.reacting_idea;

  return (
    // BE disables reactions for ideas with certain statuses
    reactingActionDescriptor.enabled ||
    isFixableByAuthentication(reactingActionDescriptor.disabled_reason)
  );
};
