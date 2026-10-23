// Where Storybook is served, without a trailing slash: the origin in dev
// (localhost:6006) and the origin plus the base path where a build is
// served under a sub path (/storybook/), so static files such as
// /images/image16.png resolve in both.
export const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return new URL('.', window.location.href).href.replace(/\/$/, '');
  }

  return '';
};
