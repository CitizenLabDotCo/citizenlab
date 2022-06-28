const NAVIGATION_PATH = '/admin/pages-menu';

function navigationPath(restOfPath: string) {
  return `${NAVIGATION_PATH}${restOfPath}`;
}

function adminPagesMenuHomepagePath() {
  // could use type checking, I initially edited it to /pages/edit...,
  // which resulted in a 404
  return navigationPath('/home-page');
}

export { adminPagesMenuHomepagePath };
