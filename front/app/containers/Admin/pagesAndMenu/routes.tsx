import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';
import { Navigate } from 'react-router-dom';
const CustomPagesIndex = lazy(() => import('./containers/CustomPages'));
const PagesAndMenuIndex = lazy(() => import('containers/Admin/pagesAndMenu'));
const NavigationSettings = lazy(() => import('./NavigationSettings'));

// homepage
const EditHomepage = lazy(() => import('./EditHomepage'));
const BottomInfoForm = lazy(() => import('./containers/BottomInfoSection'));
const TopInfoSection = lazy(() => import('./containers/TopInfoSection'));
const HeroBannerForm = lazy(() => import('./containers/HeroBanner'));

// custom pages
const NewCustomPageIndex = lazy(() => import('./containers/CustomPages/New'));
const EditCustomPageIndex = lazy(() => import('./containers/CustomPages/Edit'));
const EditCustomPageSettings = lazy(
  () => import('./containers/CustomPages/Edit/Settings')
);
const EditCustomPageContent = lazy(
  () => import('./containers/CustomPages/Edit/Content')
);

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
          <PagesAndMenuIndex />
        </PageLoading>
      ),
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <NavigationSettings />
            </PageLoading>
          ),
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
      element: (
        <PageLoading>
          <EditHomepage />
        </PageLoading>
      ),
    },
    {
      path: CUSTOM_PAGES_PATH,
      element: <CustomPagesIndex />,
      children: [
        {
          path: 'new',
          element: <NewCustomPageIndex />,
        },
        {
          path: 'edit',
          // This is the final path
          // path: 'edit/:customPageId',
          element: <EditCustomPageIndex />,
          children: [
            { path: '', element: <Navigate to="settings" /> },
            { path: 'settings', element: <EditCustomPageSettings /> },
            { path: 'content', element: <EditCustomPageContent /> },
          ],
        },
      ],
    },
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
