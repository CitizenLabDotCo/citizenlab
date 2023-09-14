// These are all disabled reason that can potentially be fixed by
// authenticating
type DisabledReasonFixable =
  | 'not_signed_in'
  | 'not_active'
  | 'not_verified'
  | 'missing_data';

type DisabledReasonUnfixable = 'not_permitted' | 'not_in_group';

export type PermissionsDisabledReason =
  | DisabledReasonFixable
  | DisabledReasonUnfixable;

const FIXABLE_REASONS = new Set<string>([
  'not_signed_in',
  // not_active here means "not registered or blocked or confirmation still required, see user.rb"
  'not_active',
  'not_verified',
  'missing_data',
] satisfies DisabledReasonFixable[]);

export const isFixableByAuthentication = (disabledReason: string) => {
  return FIXABLE_REASONS.has(disabledReason);
};

export type ActionDescriptor<DisabledReason> =
  | { enabled: true; disabled_reason: null }
  | { enabled: false; disabled_reason: DisabledReason };

// If future_enabled is a string, it's a date
export type ActionDescriptorFutureEnabled<DisabledReason> =
  | { enabled: true; disabled_reason: null; future_enabled: null }
  | {
      enabled: false;
      disabled_reason: DisabledReason;
      future_enabled: string | null;
    };
