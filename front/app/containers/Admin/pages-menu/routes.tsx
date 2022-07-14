import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';

const CustomNavbarContainer = React.lazy(
  () => import('containers/Admin/pages-menu')
);
const CustomNavbarSettingsComponent = React.lazy(
  () => import('./NavigationSettings')
);
const BottomInfoForm = lazy(() => import('./containers/BottomInfoForm'));
const TopInfoSection = lazy(() => import('./containers/TopInfoSection'));
const HeroBannerForm = lazy(() => import('./containers/HeroBannerForm'));

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
    {
      path: 'bottom-info-section',
      element: (
        <PageLoading>
          <BottomInfoForm />
        </PageLoading>
      ),
    },
    {
      path: 'top-info-section',
      element: (
        <PageLoading>
          <TopInfoSection />
        </PageLoading>
      ),
    },
    {
      path: 'homepage-banner',
      element: (
        <PageLoading>
          <HeroBannerForm />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
