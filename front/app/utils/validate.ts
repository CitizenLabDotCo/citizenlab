function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneNumber(phoneNumber: string) {
  // current back-end implementation, see phone_service.rb
  return phoneNumber.length > 5 && /^\+?[0-9\.x\-\s\(\)]+$/.test(phoneNumber);
}

export function getHasEmailValidationError(email: string | null) {
  if (email === null) return true;
  return !isValidEmail(email);
}
export function getHasPhoneNumberValidationError(phoneNumber: string | null) {
  if (phoneNumber === null) return true;
  return !isValidPhoneNumber(phoneNumber);
}
