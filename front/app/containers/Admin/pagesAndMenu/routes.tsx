import React, { lazy } from 'react';

import { RouteType } from 'routes';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

const FullScreenPreview = lazy(
  () => import('./containers/ContentBuilder/containers/FullscreenPreview')
);
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
  customPageId = '$customPageId',
  pageSettings = 'settings',
  pageContent = 'content',
  customPageIdBanner = '$customPageId/banner',
  customPageIdTopInfoSection = '$customPageId/top-info-section',
  customPageIdBottomInfoSection = '$customPageId/bottom-info-section',
  customPageIdAttachments = '$customPageId/attachments',
  customPageIdProjects = '$customPageId/projects',
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

// pages-menu grouping route (no component — PagesAndMenuIndex only wraps the index)
const pagesAndMenuRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: pagesAndMenuRoutes.pagesAndMenu,
});

// Layout route: PagesAndMenuIndex wraps the index content (NavigationSettings renders via Outlet)
const pagesAndMenuLayoutRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  id: 'pages-menu-layout',
  component: () => (
    <PageLoading>
      <PagesAndMenuIndex />
    </PageLoading>
  ),
});

const navigationSettingsRoute = createRoute({
  getParentRoute: () => pagesAndMenuLayoutRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <NavigationSettings />
    </PageLoading>
  ),
});

const homepageBuilderRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: pagesAndMenuRoutes.homepageBuilder,
  component: () => (
    <PageLoading>
      <ContentBuilder />
    </PageLoading>
  ),
});

const homepageBuilderPreviewRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: pagesAndMenuRoutes.homepageBuilderPreview,
  component: () => (
    <PageLoading>
      <FullScreenPreview />
    </PageLoading>
  ),
});

// pages layout route
const pagesRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: pagesAndMenuRoutes.pages,
  component: () => <CustomPagesIndex />,
});

const pagesNewRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.pagesNew,
  component: () => <NewCustomPageIndex />,
});

// custom page edit layout
const customPageRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.customPageId,
  component: () => <EditCustomPageIndex />,
});

const customPageIndexRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: '/',
  component: () => <Navigate to="settings" />,
});

const customPageSettingsRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: pagesAndMenuRoutes.pageSettings,
  component: () => (
    <PageLoading>
      <EditCustomPageSettings />
    </PageLoading>
  ),
});

const customPageContentRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: pagesAndMenuRoutes.pageContent,
  component: () => (
    <PageLoading>
      <EditCustomPageContent />
    </PageLoading>
  ),
});

const customPageBannerRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.customPageIdBanner,
  component: () => (
    <PageLoading>
      <CustomPageHeroBannerForm />
    </PageLoading>
  ),
});

const customPageTopInfoRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.customPageIdTopInfoSection,
  component: () => (
    <PageLoading>
      <CustomPageTopInfoSection />
    </PageLoading>
  ),
});

const customPageBottomInfoRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.customPageIdBottomInfoSection,
  component: () => (
    <PageLoading>
      <CustomPageBottomInfoSection />
    </PageLoading>
  ),
});

const customPageAttachmentsRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.customPageIdAttachments,
  component: () => (
    <PageLoading>
      <AttachmentsForm />
    </PageLoading>
  ),
});

const customPageProjectsRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: pagesAndMenuRoutes.customPageIdProjects,
  component: () => (
    <PageLoading>
      <ProjectsList />
    </PageLoading>
  ),
});

const navbarItemEditRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: 'navbar-items/edit/$navbarItemId',
  component: () => <EditNavbarItemForm />,
});

const createAdminPagesAndMenuRoutes = () => {
  return pagesAndMenuRoute.addChildren([
    pagesAndMenuLayoutRoute.addChildren([navigationSettingsRoute]),
    homepageBuilderRoute,
    homepageBuilderPreviewRoute,
    pagesRoute.addChildren([
      pagesNewRoute,
      customPageRoute.addChildren([
        customPageIndexRoute,
        customPageSettingsRoute,
        customPageContentRoute,
      ]),
      customPageBannerRoute,
      customPageTopInfoRoute,
      customPageBottomInfoRoute,
      customPageAttachmentsRoute,
      customPageProjectsRoute,
    ]),
    navbarItemEditRoute,
  ]);
};

export default createAdminPagesAndMenuRoutes;
