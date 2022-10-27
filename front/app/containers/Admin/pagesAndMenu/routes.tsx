import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';
import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Outlet from 'components/Outlet';

const CustomPagesIndex = lazy(() => import('./containers/CustomPages'));
const PagesAndMenuIndex = lazy(() => import('containers/Admin/pagesAndMenu'));

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
export const ADMIN_PAGES_MENU_PATH = `/admin/pages-menu`;
const HOMEPAGE_PATH = 'homepage';
const CUSTOM_PAGES_PATH = 'pages';
const ADMIN_PAGES_MENU_CUSTOM_PAGE_PATH = `${ADMIN_PAGES_MENU_PATH}/${CUSTOM_PAGES_PATH}`;

export const adminCustomPageContentPath = (pageId: string) => {
  return `${ADMIN_PAGES_MENU_CUSTOM_PAGE_PATH}/${pageId}/content`;
};

export default () => ({
  path: 'pages-menu', // pages-menu
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
              <Outlet id="app.containers.Admin.pages-menu.NavigationSettings" />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: HOMEPAGE_PATH, // /homepage
      element: (
        <PageLoading>
          <EditHomepage />
        </PageLoading>
      ),
    },
    {
      path: `${HOMEPAGE_PATH}/bottom-info-section`, // /homepage/bottom-info-section
      element: (
        <PageLoading>
          <HomepageBottomInfoForm />
        </PageLoading>
      ),
    },
    {
      path: `${HOMEPAGE_PATH}/top-info-section`, // /homepage/top-info-section
      element: (
        <PageLoading>
          <HomepageTopInfoSection />
        </PageLoading>
      ),
    },
    {
      path: `${HOMEPAGE_PATH}/homepage-banner`, // /homepage/homepage-banner
      element: (
        <PageLoading>
          <HomepageHeroBannerForm />
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
