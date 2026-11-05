// isAllowedOnUrl:
// This function checks if the user is on a custom page or the homepage.
export const isAllowedOnUrl = (location: string) => {
  // If the user is on a custom page or the homepage, we can show the modal
  const customPageRegex = '/pages/';
  const homepageRegex = /^\/[a-z]{2}(-[A-Z]{2}|-[A-Z][a-z]{3})?\/?$/;

  return location.match(customPageRegex) || location.match(homepageRegex);
};
