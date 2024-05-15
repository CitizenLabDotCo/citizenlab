export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const isValidUrl = (url: string) => {
  // Used this reference for generating a valid URL regex:
  // https://tutorial.eyehunts.com/js/url-regex-validation-javascript-example-code/
  const validUrlRegex =
    /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

  if (!validUrlRegex.test(url)) {
    return false;
  }
  return true;
};
