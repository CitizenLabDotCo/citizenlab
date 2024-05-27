import { MessageDescriptor } from 'react-intl';

import globalMessages from 'utils/actionDescriptors/messages';
import {
  ActionDescriptorActions,
  DisabledReason,
  DisabledReasonFixable,
} from 'utils/actionDescriptors/types';

import messages from './messages';

const FIXABLE_REASONS = new Set<string>([
  'user_not_signed_in',
  // user_not_active here means "not registered or blocked or confirmation still required, see user.rb"
  'user_not_active',
  'user_not_verified',
  'user_missing_requirements',
] satisfies DisabledReasonFixable[]);

export const isFixableByAuthentication = (disabledReason: string) => {
  return FIXABLE_REASONS.has(disabledReason);
};

// Fall back messages for disabled reasons
const globalDisabledMessages: {
  [reason in DisabledReason]?: MessageDescriptor;
} = {
  user_not_in_group: messages.defaultNotInGroup,
};

// Messages specific to a particular
const actionDisabledMessages: {
  [action in ActionDescriptorActions]?: {
    [reason in DisabledReason]?: MessageDescriptor;
  };
} = {
  posting_idea: {
    user_not_permitted: messages.postingNoPermission,
    posting_disabled: messages.postingDisabled,
    posting_limited_max_reached: messages.postingLimitedMaxReached,
    project_inactive: messages.postingInactive,
    future_enabled: messages.postingNotYetPossible,
    // idea_not_in_current_phase: messages.postingInNonActivePhases, // TODO: JS is this state able to be triggered?
  },
  commenting_idea: {
    project_inactive: messages.commentingDisabledInactiveProject,
    commenting_disabled: messages.commentingDisabledProject,
    user_not_permitted: messages.commentingDisabledProject,
    user_not_verified: messages.commentingDisabledUnverified,
    user_not_in_group: globalMessages.defaultNotInGroup,
    user_blocked: messages.commentingDisabledProject,
    user_not_active: messages.completeProfileToComment,
    user_not_signed_in: messages.signInToComment,
    user_missing_requirements: messages.completeProfileToComment,
    idea_not_in_current_phase: messages.commentingDisabledInCurrentPhase,
  },
  commenting_initiative: {
    user_not_active: messages.completeProfileToComment,
    user_not_permitted: messages.commentingInitiativeMaybeNotPermitted,
    user_not_signed_in: messages.commentingInitiativeMaybeNotPermitted,
    user_not_verified: messages.commentingDisabledUnverified,
    user_missing_requirements: messages.completeProfileToComment,
    // user_not_signed_in_needs_verifying: messages.signInAndVerifyToCommentInitiative, // TODO: JS - a state that the backend can never trigger
  },
  voting: {
    user_not_signed_in: messages.votingNotSignedIn,
    user_not_permitted: messages.votingNotPermitted,
    user_not_in_group: messages.votingNotInGroup,
    user_blocked: messages.votingNotPermitted,
    user_not_verified: messages.votingNotVerified,
  },
  budgeting: {
    user_not_signed_in: messages.budgetingNotSignedIn,
    user_not_permitted: messages.budgetingNotPermitted,
    user_not_in_group: messages.budgetingNotInGroup,
    user_blocked: messages.budgetingNotPermitted,
    user_not_verified: messages.budgetingNotVerified,
  },
};

/**
 * Return a disabled message ID based on the disabled reason returned by the action descriptors
 */
export const getPermissionsDisabledMessage = (
  action: ActionDescriptorActions,
  disabledReason: string | null | undefined,
  notFixableOnly?: boolean
) => {
  if (!disabledReason) return;
  if (notFixableOnly && isFixableByAuthentication(disabledReason)) return;

  // Shim for budgeting voting action
  const message = actionDisabledMessages[action]?.[disabledReason];
  if (message) return message;

  // Fallback to defaults if no specific message for the action
  const globalMessage = globalDisabledMessages[disabledReason];
  if (globalMessage) return globalMessage;
};
