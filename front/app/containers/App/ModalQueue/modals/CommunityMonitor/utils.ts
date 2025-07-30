// isAllowedOnUrl:
// This function checks if the user is on a custom page or the homepage.
export const isAllowedOnUrl = (location: string) => {
  // If the user is on a custom page or the homepage, we can show the modal
  const customPageRegex = '/pages/';
  const homepageRegex = /^\/[a-zA-Z]{2}\/(?!\w)/;

  return location.match(customPageRegex) || location.match(homepageRegex);
};
