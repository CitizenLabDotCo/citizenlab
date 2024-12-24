import { MessageDescriptor } from 'react-intl';

import globalMessages from 'utils/actionDescriptors/messages';
import {
  ActionDescriptorAction,
  DisabledReason,
  DisabledReasonFixable,
} from 'utils/actionDescriptors/types';

import messages from './messages';

const FIXABLE_REASONS = new Set<string>([
  'user_not_signed_in',
  'user_not_active', // means "not registered or blocked or confirmation still required, see user.rb"
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

// Messages specific to each action
const actionDisabledMessages: {
  [action in ActionDescriptorAction]?: {
    [reason in DisabledReason]?: MessageDescriptor;
  };
} = {
  posting_idea: {
    user_not_permitted: messages.postingNoPermission,
    posting_disabled: messages.postingDisabled,
    posting_limited_max_reached: messages.postingLimitedMaxReached,
    project_inactive: messages.postingInactive,
    future_enabled: messages.postingNotYetPossible,
    inactive_phase: messages.postingInNonActivePhases,
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
  reacting_idea: {
    project_inactive: messages.reactingDisabledProjectInactive,
    reacting_disabled: messages.reactingNotEnabled,
    reacting_like_limited_max_reached: messages.likingDisabledMaxReached,
    reacting_dislike_limited_max_reached: messages.dislikingDisabledMaxReached,
    idea_not_in_current_phase: messages.reactingDisabledPhaseOver,
    user_not_permitted: messages.reactingNotPermitted,
    user_not_verified: messages.reactingVerifyToReact,
    user_not_in_group: globalMessages.defaultNotInGroup,
    user_blocked: messages.reactingNotPermitted,
    user_not_active: messages.completeProfileToReact,
    user_not_signed_in: messages.reactingNotSignedIn,
    user_missing_requirements: messages.completeProfileToReact,
    future_enabled: messages.reactingDisabledFutureEnabled,
  },
  voting: {
    user_not_signed_in: messages.votingNotSignedIn,
    user_not_permitted: messages.votingNotPermitted,
    user_not_in_group: messages.votingNotInGroup,
    user_blocked: messages.votingNotPermitted,
    user_not_verified: messages.votingNotVerified,
    project_inactive: messages.votingDisabledProjectInactive,
  },
  budgeting: {
    user_not_signed_in: messages.budgetingNotSignedIn,
    user_not_permitted: messages.budgetingNotPermitted,
    user_not_in_group: messages.budgetingNotInGroup,
    user_blocked: messages.budgetingNotPermitted,
    user_not_verified: messages.budgetingNotVerified,
    project_inactive: messages.votingDisabledProjectInactive,
  },
  annotating_document: {
    project_inactive: messages.documentAnnotationDisabledProjectInactive,
    project_not_visible: messages.documentAnnotationDisabledNotPermitted,
    not_document_annotation: messages.documentAnnotationDisabledNotActivePhase,
    user_not_active: messages.documentAnnotationDisabledNotActiveUser,
    user_not_verified: messages.documentAnnotationDisabledNotVerified,
    user_missing_requirements: messages.documentAnnotationDisabledNotActiveUser,
    user_not_signed_in: messages.documentAnnotationDisabledMaybeNotPermitted,
    user_not_permitted: messages.documentAnnotationDisabledNotPermitted,
    user_blocked: messages.documentAnnotationDisabledNotPermitted,
  },
  taking_survey: {
    project_inactive: messages.surveyDisabledProjectInactive,
    project_not_visible: messages.surveyDisabledNotPermitted,
    not_survey: messages.surveyDisabledNotActivePhase,
    user_not_active: messages.surveyDisabledNotActiveUser,
    user_not_verified: messages.surveyDisabledNotVerified,
    user_missing_requirements: messages.surveyDisabledNotActiveUser,
    user_not_signed_in: messages.surveyDisabledMaybeNotPermitted,
    user_not_permitted: messages.surveyDisabledNotPermitted,
    user_blocked: messages.surveyDisabledNotPermitted,
  },
  taking_poll: {
    project_inactive: messages.pollDisabledProjectInactive,
    project_not_visible: messages.pollDisabledNotPermitted,
    not_poll: messages.pollDisabledNotActivePhase,
    already_responded: messages.pollDisabledAlreadyResponded,
    user_not_permitted: messages.pollDisabledNotPermitted,
    user_blocked: messages.pollDisabledNotPermitted,
  },
  attending_event: {
    user_not_signed_in: messages.attendingEventNotSignedIn,
    user_not_permitted: messages.attendingEventNotPermitted,
    user_not_in_group: messages.attendingEventNotInGroup,
    user_blocked: messages.attendingEventNotPermitted,
    user_not_verified: messages.attendingEventNotVerified,
    user_missing_requirements: messages.attendingEventMissingRequirements,
  },
  volunteering: {
    user_not_signed_in: messages.volunteeringNotSignedIn,
    user_not_active: messages.volunteeringNotActiveUser,
    user_not_verified: messages.volunteeringNotVerified,
    user_missing_requirements: messages.volunteeringMissingRequirements,
    user_not_permitted: messages.volunteeringNotPermitted,
    user_not_in_group: messages.volunteeringNotInGroup,
    user_blocked: messages.volunteeringNotPermitted,
  },
};

/**
 * Return a disabled message ID based on the disabled reason returned by the action descriptors
 */
export const getPermissionsDisabledMessage = (
  action: ActionDescriptorAction,
  disabledReason: DisabledReason | null | undefined,
  notFixableOnly?: boolean
) => {
  if (!disabledReason) return;
  if (notFixableOnly && isFixableByAuthentication(disabledReason)) return;

  // Shim for budgeting voting action
  const message = actionDisabledMessages[action]?.[disabledReason];
  if (message) return message;

  // Fallback to defaults if no specific message for the action
  return globalDisabledMessages[disabledReason];
};
