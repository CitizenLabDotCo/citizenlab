import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';

const CustomNavbarContainer = lazy(
  () => import('containers/Admin/flexible-pages')
);
const CustomNavbarSettingsComponent = lazy(
  () => import('./NavigationSettings')
);
const EditHomepage = lazy(() => import('./EditHomepage'));

export default () => ({
  path: 'pages-menu',
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
      path: 'home-page',
      element: <EditHomepage />,
    },
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
