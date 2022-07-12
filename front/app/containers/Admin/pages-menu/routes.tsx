import React from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';

const CustomNavbarContainer = React.lazy(
  () => import('containers/Admin/pages-menu')
);
const CustomNavbarSettingsComponent = React.lazy(
  () => import('./NavigationSettings')
);

export const PAGES_MENU_PATH = '/admin/pages-menu';

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
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
