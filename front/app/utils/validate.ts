export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Accepts an optional leading +, followed by 6 to 15 digits. Spaces, dashes,
// dots and parentheses are allowed as separators and ignored.
export function isValidPhoneNumber(phoneNumber: string) {
  return /^\+?\d{6,15}$/.test(phoneNumber.replace(/[\s\-.()]/g, ''));
}

// Used this reference for generating a valid URL regex:
// https://tutorial.eyehunts.com/js/url-regex-validation-javascript-example-code/
const validUrlRegex =
  /(http(s)?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,64}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

export const isValidUrl = (url: string) => {
  return !!url.match(validUrlRegex);
};
