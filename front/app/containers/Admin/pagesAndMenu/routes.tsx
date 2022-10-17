import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';
import { Navigate } from 'react-router-dom';
const CustomPagesIndex = lazy(() => import('./containers/CustomPages'));
const PagesAndMenuIndex = lazy(() => import('containers/Admin/pagesAndMenu'));
const NavigationSettings = lazy(
  () => import('./containers/NavigationSettings')
);

// homepage
const EditHomepage = lazy(() => import('./containers/EditHomepage'));
const HomepageBottomInfoForm = lazy(
  () => import('./EditHomepage/BottomInfoSection')
);
const HomepageTopInfoSection = lazy(
  () => import('./EditHomepage/TopInfoSection')
);
const CustomPageTopInfoSection = lazy(
  () => import('./containers/CustomPages/Edit/Content/TopInfoSection')
);
const CustomPageBottomInfoSection = lazy(
  () => import('./containers/CustomPages/Edit/Content/BottomInfoSection')
);
const HomepageHeroBannerForm = lazy(() => import('./EditHomepage/HeroBanner'));

// custom pages
const NewCustomPageIndex = lazy(() => import('./containers/CustomPages/New'));
const EditCustomPageIndex = lazy(() => import('./containers/CustomPages/Edit'));
const EditCustomPageSettings = lazy(
  () => import('./containers/CustomPages/Edit/Settings')
);
const EditCustomPageContent = lazy(
  () => import('./containers/CustomPages/Edit/Content')
);
const AttachmentsForm = lazy(() => import('./containers/Attachments'));
const CustomPageHeroBannerForm = lazy(
  () => import('./containers/CustomPages/Edit/HeroBanner')
);

// path utils
const PAGE_PATH = 'pages-menu';
const ADMIN_PATH_PREFIX = 'admin';
export const PAGES_MENU_PATH = `/${ADMIN_PATH_PREFIX}/${PAGE_PATH}`;
const HOMEPAGE_PATH = 'homepage';
const CUSTOM_PAGES_PATH = 'pages';
export const PAGES_MENU_CUSTOM_PATH = `${PAGES_MENU_PATH}/${CUSTOM_PAGES_PATH}`;

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
          <HomepageBottomInfoForm />
        </PageLoading>
      ),
    },
    {
      path: 'top-info-section',
      element: (
        <PageLoading>
          <HomepageTopInfoSection />
        </PageLoading>
      ),
    },
    {
      path: 'homepage-banner',
      element: (
        <PageLoading>
          <HomepageHeroBannerForm />
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
      path: CUSTOM_PAGES_PATH, // pages
      element: <CustomPagesIndex />,
      children: [
        {
          path: 'new',
          element: <NewCustomPageIndex />,
        },
        {
          path: ':customPageId',
          element: <EditCustomPageIndex />,
          children: [
            { path: '', element: <Navigate to="settings" /> }, // to handle manually changing URL
            {
              path: 'settings',
              element: (
                <PageLoading>
                  <EditCustomPageSettings />
                </PageLoading>
              ),
            },
            {
              path: 'content',
              element: (
                <PageLoading>
                  <EditCustomPageContent />
                </PageLoading>
              ),
            },
          ],
        },
        {
          path: ':customPageId/banner',
          element: (
            <PageLoading>
              <CustomPageHeroBannerForm />
            </PageLoading>
          ),
        },
        {
          path: ':customPageId/top-info-section',
          element: (
            <PageLoading>
              <CustomPageTopInfoSection />
            </PageLoading>
          ),
        },
        // {
        //   path: ':customPageId/projects',
        //   element: <></>,
        // },
        {
          path: ':customPageId/bottom-info-section',
          element: (
            <PageLoading>
              <CustomPageBottomInfoSection />
            </PageLoading>
          ),
        },
        {
          path: ':customPageId/attachments',
          element: (
            <PageLoading>
              <AttachmentsForm />
            </PageLoading>
          ),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.pages-menu'],
  ],
});
