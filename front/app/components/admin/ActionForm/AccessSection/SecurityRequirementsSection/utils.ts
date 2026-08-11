import { AuthMethodKey } from '../../types';

type Params = {
  sms2FAEnabled: boolean;
  smsLoginEnabled: boolean;
  verificationMethodEnabled: boolean;
  authenticationMethodEnabled: boolean;
};

export const getVisibleToggles = ({
  sms2FAEnabled,
  smsLoginEnabled,
  verificationMethodEnabled,
  authenticationMethodEnabled,
}: Params): AuthMethodKey[] => {
  const visibleToggles: AuthMethodKey[] = [];

  if ((sms2FAEnabled && smsLoginEnabled) || authenticationMethodEnabled) {
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
