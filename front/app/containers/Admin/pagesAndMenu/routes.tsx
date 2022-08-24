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
const ADMIN_PAGE_PATH = 'pages-menu';
const PATH_PREFIX = `admin/${ADMIN_PAGE_PATH}`;
const HOMEPAGE_PATH = 'homepage';
const CUSTOM_PAGES_PATH = 'custom';

function adminPagesMenuHomepagePath() {
  // could use type checking, I initially edited it to /pages/edit...,
  // which resulted in a 404
  return `/${PATH_PREFIX}/${HOMEPAGE_PATH}`;
}

export { adminPagesMenuHomepagePath };

// routes
export const PAGES_MENU_PATH = '/admin/pages-menu';

export default () => ({
  path: ADMIN_PAGE_PATH, // pages-menu
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
