import { IIdeaStatus } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import { isFixableByAuthentication } from 'utils/actionDescriptors';

export const showIdeationReactions = (idea: IIdeaData) => {
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

export const showProposalsReactions = (ideaStatus: IIdeaStatus) => {
  const code = ideaStatus.data.attributes.code;

  return (
    code === 'proposed' ||
    code === 'threshold_reached' ||
    code === 'custom' ||
    code === 'answered'
  );
};
