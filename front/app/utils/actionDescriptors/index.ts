import { MessageDescriptor } from 'react-intl';

import messages from './messages';

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
  [action in ActionDescriptorActions]?: {
    [reason in UserDisabledReason]?: MessageDescriptor;
  };
} = {
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
  const message = disabledMessages[action]?.[disabledReason];
  if (message) return message;

  // Could potentially add global defaults as a fallback
};
