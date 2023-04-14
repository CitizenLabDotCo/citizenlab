// These are all disabled reason that can potentially be fixed by
// authenticating
type DisabledReasonFixable =
  | 'not_signed_in'
  | 'not_active'
  | 'not_verified'
  | 'missing_data';

type DisabledReasonUnfixable = 'not_permitted';

export type PermissionsDisabledReason =
  | DisabledReasonFixable
  | DisabledReasonUnfixable;

const FIXABLE_REASONS = new Set<string>([
  'not_signed_in',
  'not_active',
  'not_verified',
  'missing_data',
] satisfies DisabledReasonFixable[]);

export const isFixableByAuthentication = (disabledReason: string) => {
  return FIXABLE_REASONS.has(disabledReason);
};
