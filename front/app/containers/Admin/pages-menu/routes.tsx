import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';
const CustomNavbarContainer = lazy(() => import('containers/Admin/pages-menu'));
const CustomNavbarSettingsComponent = lazy(
  () => import('./NavigationSettings')
);
const EditHomepage = lazy(() => import('./EditHomepage'));

// path utils
const ADMIN_PAGE_PATH = 'pages-menu';
const PATH_PREFIX = `admin/${ADMIN_PAGE_PATH}`;
const HOMEPAGE_PATH = 'homepage';

function adminPagesMenuHomepagePath() {
  // could use type checking, I initially edited it to /pages/edit...,
  // which resulted in a 404
  return `/${PATH_PREFIX}/${HOMEPAGE_PATH}`;
}

export { adminPagesMenuHomepagePath };

// routes
export const PAGES_MENU_PATH = '/admin/pages-menu';

export default () => ({
  path: ADMIN_PAGE_PATH,
  element: (
    <PageLoading>
      <CustomNavbarContainer />
    </PageLoading>
  ),
  children: [
    {
      // to be changed when refactoring
      // path: '' should only be used for redirects on
      // index. Search the codebase for examples
      path: '',
      element: <CustomNavbarSettingsComponent />,
    },
    {
      path: HOMEPAGE_PATH,
      element: <EditHomepage />,
    },
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
