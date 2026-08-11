// The security requirements on offer: each one maps onto a `require_*` boolean
// + `*_expiry` pair on the permission.
type SecurityRequirementKey = 'email' | 'phone' | 'verification';
type VisibleToggles = Record<SecurityRequirementKey, boolean>;

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
}: Params): VisibleToggles => {
  const visibleToggles: VisibleToggles = {
    email: false,
    phone: false,
    verification: false,
  };

  if ((sms2FAEnabled && smsLoginEnabled) || hasAuthMethodNotReturningEmail) {
    // Requiring an email or not is only relevant if there exists
    // a way for participants to sign up WITHOUT an email address.
    // If you e.g. can only sign up with email, email confirmed is always required,
    // so there is no need to make it configurable.
    visibleToggles.email = true;
  }

  if (sms2FAEnabled) {
    visibleToggles.phone = true;
  }

  if (verificationMethodEnabled) {
    visibleToggles.verification = true;
  }

  return visibleToggles;
};
