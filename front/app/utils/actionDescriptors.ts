// These are all disabled reason that can potentially be fixed by
// authenticating
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
