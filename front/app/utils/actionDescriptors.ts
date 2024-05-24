// These are all disabled reason that can potentially be fixed by
// authenticating
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { MessageDescriptor } from 'react-intl';
import votingMessages from 'utils/configs/participationMethodConfig/voting/messages';

type DisabledReasonFixable =
  | 'user_not_signed_in'
  | 'user_not_active'
  | 'user_not_verified'
  | 'user_missing_requirements';

type DisabledReasonUnfixable =
  | 'user_not_permitted'
  | 'user_not_in_group'
  | 'user_blocked';

export type UserDisabledReason =
  | DisabledReasonFixable
  | DisabledReasonUnfixable;

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

export type ActionDescriptor<DisabledReason> =
  | { enabled: true; disabled_reason: null }
  | { enabled: false; disabled_reason: DisabledReason };

// If future_enabled_at is a string, it's a date
export type ActionDescriptorFutureEnabled<DisabledReason> =
  | { enabled: true; disabled_reason: null; future_enabled_at: null }
  | {
      enabled: false;
      disabled_reason: DisabledReason;
      future_enabled_at: string | null;
    };

// NOTE: Bit of a shim to add in the budgeting action - even though it doesn't really exist
type ActionDescriptorActions = 'voting' | 'budgeting';

const disabledMessages: {
  [method in ParticipationMethod]?: {
    [action in ActionDescriptorActions]?: {
      [reason in UserDisabledReason]?: MessageDescriptor;
    };
  };
} = {
  voting: {
    voting: {
      user_not_signed_in: votingMessages.votingNotSignedIn,
      user_not_permitted: votingMessages.votingNotPermitted,
      user_not_in_group: votingMessages.votingNotInGroup,
      user_blocked: votingMessages.votingNotPermitted,
      user_not_verified: votingMessages.votingNotVerified,
    },
    budgeting: {
      user_not_signed_in: votingMessages.budgetingNotSignedIn,
      user_not_permitted: votingMessages.budgetingNotPermitted,
      user_not_in_group: votingMessages.budgetingNotInGroup,
      user_blocked: votingMessages.budgetingNotPermitted,
      user_not_verified: votingMessages.budgetingNotVerified,
    },
  },
};

/**
 * Return a disabled message ID based on the disabled reason returned by the backend
 * TODO: JS - this isn't going to work with multiple actions per method - oh poo
 * TODO: JS - Add action into array?
 */
export const getPermissionsDisabledMessage = (
  action: string,
  disabledReason: string | null | undefined,
  phase: IPhaseData,
  notFixableOnly?: boolean
) => {
  if (!disabledReason) return;
  if (notFixableOnly && isFixableByAuthentication(disabledReason)) return;

  const participationMethod = phase.attributes.participation_method;

  // Shim for budgeting voting action
  const message =
    participationMethod === 'voting' &&
    phase?.attributes.voting_method === 'budgeting'
      ? disabledMessages.voting?.budgeting?.[disabledReason]
      : disabledMessages[participationMethod]?.[action]?.[disabledReason];
  if (message) return message;

  // Could potentially add global defaults as a fallback
};
