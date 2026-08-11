// The security requirements on offer: each one maps onto a `require_*` boolean
// + `*_expiry` pair on the permission.
export type SecurityRequirementKey = 'email' | 'phone' | 'verification';

type Params = {
  sms2FAEnabled: boolean;
  smsLoginEnabled: boolean;
  verificationMethodEnabled: boolean;
  hasAuthMethodNotReturningEmail: boolean;
};

export const getVisibleToggles = ({
  sms2FAEnabled,
  smsLoginEnabled,
  verificationMethodEnabled,
  hasAuthMethodNotReturningEmail,
}: Params): SecurityRequirementKey[] => {
  const visibleToggles: SecurityRequirementKey[] = [];

  if ((sms2FAEnabled && smsLoginEnabled) || hasAuthMethodNotReturningEmail) {
    // Requiring an email or not is only relevant if there exists
    // a way for participants to sign up WITHOUT an email address.
    // If you e.g. can only sign up with email, email confirmed is always required,
    // so there is no need to make it configurable.
    visibleToggles.push('email');
  }

  if (sms2FAEnabled) {
    visibleToggles.push('phone');
  }

  if (verificationMethodEnabled) {
    visibleToggles.push('verification');
  }

  return visibleToggles;
};
