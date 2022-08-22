import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';
const CustomNavbarContainer = lazy(
  () => import('containers/Admin/pagesAndMenu')
);
const CustomNavbarSettingsComponent = lazy(
  () => import('./NavigationSettings')
);

// homepage
const EditHomepage = lazy(() => import('./EditHomepage'));
const BottomInfoForm = lazy(() => import('./containers/BottomInfoSection'));
const TopInfoSection = lazy(() => import('./containers/TopInfoSection'));
const HeroBannerForm = lazy(() => import('./containers/HeroBanner'));

// custom pages
const NewCustomPage = lazy(() => import('./containers/CustomPages/New'));

// path utils
const PAGE_PATH = 'pages-menu';
const ADMIN_PATH_PREFIX = 'admin';
export const PAGES_MENU_PATH = `/${ADMIN_PATH_PREFIX}/${PAGE_PATH}`;
const HOMEPAGE_PATH = 'homepage';
const CUSTOM_PAGES_PATH = 'custom';

export default () => ({
  path: PAGE_PATH, // pages-menu
  children: [
    {
      path: '',
      element: (
        <PageLoading>
          <CustomNavbarContainer />
        </PageLoading>
      ),
      children: [
        {
          index: true,
          // the main page with outlets and a visual container
          element: <CustomNavbarSettingsComponent />,
        },
      ],
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
    {
      path: HOMEPAGE_PATH,
      element: <EditHomepage />,
    },
    {
      path: `${CUSTOM_PAGES_PATH}/new`,
      element: <NewCustomPage />,
    },
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
