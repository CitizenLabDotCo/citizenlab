import React, { lazy } from 'react';

import { Navigate } from 'react-router-dom';
import { RouteType } from 'routes';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

import FullScreenPreview from './containers/ContentBuilder/containers/FullscreenPreview';

const CustomPagesIndex = lazy(() => import('./containers/CustomPages'));
const PagesAndMenuIndex = lazy(() => import('containers/Admin/pagesAndMenu'));
const NavigationSettings = lazy(
  () => import('./containers/NavigationSettings')
);
const EditNavbarItemForm = lazy(
  () => import('./containers/EditNavbarItemForm')
);

const CustomPageTopInfoSection = lazy(
  () => import('./containers/CustomPages/Edit/Content/TopInfoSection')
);
const CustomPageBottomInfoSection = lazy(
  () => import('./containers/CustomPages/Edit/Content/BottomInfoSection')
);
const ContentBuilder = lazy(
  () => import('./containers/ContentBuilder/containers')
);
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
const ProjectsList = lazy(() => import('./containers/ProjectsList'));
const CustomPageHeroBannerForm = lazy(
  () => import('./containers/CustomPages/Edit/HeroBanner')
);

// path utils
export const ADMIN_PAGES_MENU_PATH = `/admin/pages-menu`;

export const adminCustomPageContentPath = (pageId: string): RouteType => {
  return `/admin/pages-menu/pages/${pageId}/content`;
};

export const adminCustomPageSettingsPath = (pageId: string): RouteType => {
  return `/admin/pages-menu/pages/${pageId}/settings`;
};

export enum pagesAndMenuRoutes {
  pagesAndMenu = 'pages-menu',
  pagesAndMenuDefault = '',
  homepageBuilder = 'homepage-builder',
  homepageBuilderPreview = 'homepage-builder/preview',
  pages = 'pages',
  pagesNew = 'new',
  customPageId = ':customPageId',
  pageSettings = 'settings',
  pageContent = 'content',
  customPageIdBanner = ':customPageId/banner',
  customPageIdTopInfoSection = ':customPageId/top-info-section',
  customPageIdBottomInfoSection = ':customPageId/bottom-info-section',
  customPageIdAttachments = ':customPageId/attachments',
  customPageIdProjects = ':customPageId/projects',
}

export type pagesAndMenuRouteTypes =
  | AdminRoute<pagesAndMenuRoutes.pagesAndMenu>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${string}`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.homepageBuilder}`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${pagesAndMenuRoutes.pagesNew}`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/${pagesAndMenuRoutes.pageSettings}`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/${pagesAndMenuRoutes.pageContent}`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/banner`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/top-info-section`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/bottom-info-section`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/attachments`>
  | AdminRoute<`${pagesAndMenuRoutes.pagesAndMenu}/${pagesAndMenuRoutes.pages}/${string}/projects`>;

export default () => ({
  path: pagesAndMenuRoutes.pagesAndMenu, // pages-menu
  children: [
    {
      path: pagesAndMenuRoutes.pagesAndMenuDefault,
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
      path: pagesAndMenuRoutes.homepageBuilder,
      element: (
        <PageLoading>
          <ContentBuilder />
        </PageLoading>
      ),
    },
    {
      path: pagesAndMenuRoutes.homepageBuilderPreview,
      element: (
        <PageLoading>
          <FullScreenPreview />
        </PageLoading>
      ),
    },
    {
      path: pagesAndMenuRoutes.pages,
      element: <CustomPagesIndex />,
      children: [
        {
          path: pagesAndMenuRoutes.pagesNew,
          element: <NewCustomPageIndex />,
        },
        {
          path: pagesAndMenuRoutes.customPageId,
          element: <EditCustomPageIndex />,
          children: [
            { path: '', element: <Navigate to="settings" /> }, // to handle manually changing URL
            {
              path: pagesAndMenuRoutes.pageSettings,
              element: (
                <PageLoading>
                  <EditCustomPageSettings />
                </PageLoading>
              ),
            },
            {
              path: pagesAndMenuRoutes.pageContent,
              element: (
                <PageLoading>
                  <EditCustomPageContent />
                </PageLoading>
              ),
            },
          ],
        },
        {
          path: pagesAndMenuRoutes.customPageIdBanner,
          element: (
            <PageLoading>
              <CustomPageHeroBannerForm />
            </PageLoading>
          ),
        },
        {
          path: pagesAndMenuRoutes.customPageIdTopInfoSection,
          element: (
            <PageLoading>
              <CustomPageTopInfoSection />
            </PageLoading>
          ),
        },
        {
          path: pagesAndMenuRoutes.customPageIdBottomInfoSection,
          element: (
            <PageLoading>
              <CustomPageBottomInfoSection />
            </PageLoading>
          ),
        },
        {
          path: pagesAndMenuRoutes.customPageIdAttachments,
          element: (
            <PageLoading>
              <AttachmentsForm />
            </PageLoading>
          ),
        },
        {
          path: pagesAndMenuRoutes.customPageIdProjects,
          element: (
            <PageLoading>
              <ProjectsList />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: 'navbar-items/edit/:navbarItemId',
      element: <EditNavbarItemForm />,
    },
  ],
});
