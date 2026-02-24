import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute } from '../routes';

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

export const adminCustomPageContentPath = (pageId: string) => {
  return `/admin/pages-menu/pages/${pageId}/content`;
};

export const adminCustomPageSettingsPath = (pageId: string) => {
  return `/admin/pages-menu/pages/${pageId}/settings`;
};

// pages-menu grouping route (no component — PagesAndMenuIndex only wraps the index)
const pagesAndMenuRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'pages-menu',
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
  path: 'homepage-builder',
  component: () => (
    <PageLoading>
      <ContentBuilder />
    </PageLoading>
  ),
});

const homepageBuilderPreviewRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: 'homepage-builder/preview',
  component: () => (
    <PageLoading>
      <FullScreenPreview />
    </PageLoading>
  ),
});

// pages layout route
const pagesRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: 'pages',
  component: () => <CustomPagesIndex />,
});

const pagesNewRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: 'new',
  component: () => <NewCustomPageIndex />,
});

// custom page edit layout
const customPageRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: '$customPageId',
  component: () => <EditCustomPageIndex />,
});

const customPageIndexRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: '/',
  component: () => <Navigate to="settings" />,
});

const customPageSettingsRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: 'settings',
  component: () => (
    <PageLoading>
      <EditCustomPageSettings />
    </PageLoading>
  ),
});

const customPageContentRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: 'content',
  component: () => (
    <PageLoading>
      <EditCustomPageContent />
    </PageLoading>
  ),
});

const customPageBannerRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: '$customPageId/banner',
  component: () => (
    <PageLoading>
      <CustomPageHeroBannerForm />
    </PageLoading>
  ),
});

const customPageTopInfoRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: '$customPageId/top-info-section',
  component: () => (
    <PageLoading>
      <CustomPageTopInfoSection />
    </PageLoading>
  ),
});

const customPageBottomInfoRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: '$customPageId/bottom-info-section',
  component: () => (
    <PageLoading>
      <CustomPageBottomInfoSection />
    </PageLoading>
  ),
});

const customPageAttachmentsRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: '$customPageId/attachments',
  component: () => (
    <PageLoading>
      <AttachmentsForm />
    </PageLoading>
  ),
});

const customPageProjectsRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: '$customPageId/projects',
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
