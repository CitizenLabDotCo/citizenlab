export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phoneNumber: string) {
  // current back-end implementation, see phone_service.rb
  return phoneNumber.length > 5 && /^\+?[0-9.x\-\s()]+$/.test(phoneNumber);
}
