import React, { lazy } from 'react';

import * as yup from 'yup';

import { supportedLocales } from 'containers/App/constants';

import PageLoading from 'components/UI/PageLoading';

import Navigate from 'utils/cl-router/Navigate';
import { createRoute, useParams } from 'utils/router';

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

export const adminCustomPageContentLink = (customPageId: string) =>
  ({
    to: '/admin/pages-menu/pages/$customPageId/content',
    params: { customPageId },
  } as const);

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

const homepageBuilderSearchSchema = yup.object({
  variant: yup.string().oneOf(['signedIn', 'signedOut']).optional(),
});

const homepageBuilderRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: 'homepage-builder',
  validateSearch: (search: Record<string, unknown>) =>
    homepageBuilderSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <ContentBuilder />
    </PageLoading>
  ),
});

const homepageBuilderPreviewSearchSchema = yup.object({
  selected_locale: yup.string().oneOf(supportedLocales).optional(),
});

const homepageBuilderPreviewRoute = createRoute({
  getParentRoute: () => pagesAndMenuRoute,
  path: 'homepage-builder/preview',
  validateSearch: (search: Record<string, unknown>) =>
    homepageBuilderPreviewSearchSchema.validateSync(search, {
      stripUnknown: true,
    }),
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

const CustomPageIndexRedirect = () => {
  const { customPageId } = useParams({
    from: '/$locale/admin/pages-menu/pages/$customPageId',
  });
  return (
    <Navigate
      to="/admin/pages-menu/pages/$customPageId/settings"
      params={{ customPageId }}
    />
  );
};

const customPageIndexRoute = createRoute({
  getParentRoute: () => customPageRoute,
  path: '/',
  component: CustomPageIndexRedirect,
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
