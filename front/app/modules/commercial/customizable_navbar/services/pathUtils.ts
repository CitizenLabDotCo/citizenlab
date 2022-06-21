const NAVIGATION_PATH = '/admin/pages-menu';

function navigationPath(restOfPath: string) {
  return `${NAVIGATION_PATH}${restOfPath}`;
}
function adminPagesMenuPagesEditHomePath() {
  return navigationPath('/pages/edit/home-page');
}

export { adminPagesMenuPagesEditHomePath };
