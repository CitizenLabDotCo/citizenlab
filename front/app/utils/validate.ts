export function isValidEmail(email: string) {
  return email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: string) {
  // current back-end implementation, see phone_service.rb
  return phone.length > 5 && /^\+?[0-9\.x\-\s\(\)]+$/.test(phone);
}

export function getHasEmailOrPhoneNumberValidationError(
  emailOrPhoneNumber: string | null,
  phoneLoginEnabled: boolean
) {
  if (emailOrPhoneNumber === null) {
    return {
      hasPhoneNumberValidationError: true,
      hasEmailValidationError: true,
    };
  }

  const hasPhoneNumberValidationError =
    phoneLoginEnabled && isValidPhoneNumber(emailOrPhoneNumber);
  const hasEmailValidationError =
    (!phoneLoginEnabled ||
      (phoneLoginEnabled && hasPhoneNumberValidationError)) &&
    !isValidEmail(emailOrPhoneNumber);

  return {
    hasPhoneNumberValidationError,
    hasEmailValidationError,
  };
}
