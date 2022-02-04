export function isCLErrorJSON(error) {
  return !!(error && error.json && error.json.errors);
}
