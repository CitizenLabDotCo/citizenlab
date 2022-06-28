const NAVIGATION_PATH = '/admin/pages-menu';

function navigationPath(restOfPath: string) {
  return `${NAVIGATION_PATH}${restOfPath}`;
}

function adminPagesMenuPagesEditHomePath() {
  // could use type checking, I initially edited it to /pages/edit...,
  // which resulted in a 404
  return navigationPath('/edit/home-page');
}

export { adminPagesMenuPagesEditHomePath };
