import React, { lazy } from 'react';

import {
  createRoute,
  createRootRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as yup from 'yup';

import type { InputStatusCode } from 'api/idea_statuses/types';
import type { IdeaSortMethod } from 'api/phases/types';

import { createAdminRoutes } from 'containers/Admin/routes';
import App from 'containers/App';
import { createUserShowPageRoutes } from 'containers/UsersShowPage/routes';

import PageLoading from 'components/UI/PageLoading';

import type { Routes } from 'utils/moduleUtils';

const HomePage = lazy(() => import('containers/HomePage'));
const SiteMap = lazy(() => import('containers/SiteMap'));
const UsersEditPage = lazy(() => import('containers/UsersEditPage'));
const PasswordChange = lazy(() => import('containers/PasswordChange'));
const EmailChange = lazy(() => import('containers/EmailChange'));
const IdeasEditPage = lazy(() => import('containers/IdeasEditPage'));
const IdeasIndexPage = lazy(() => import('containers/IdeasIndexPage'));
const IdeasShowPage = lazy(() => import('containers/IdeasShowPage'));
const IdeasNewPage = lazy(() => import('containers/IdeasNewPage'));
const IdeasNewSurveyPage = lazy(() => import('containers/IdeasNewSurveyPage'));
const ProjectsIndexPage = lazy(() => import('containers/ProjectsIndexPage'));
const ProjectsShowPage = lazy(() => import('containers/ProjectsShowPage'));
const ProjectFolderShowPage = lazy(
  () => import('containers/ProjectFolderShowPage')
);
const EventsPage = lazy(() => import('containers/EventsPage'));
const EventsShowPage = lazy(() => import('containers/EventsShowPage'));
const CookiePolicy = lazy(() => import('containers/CookiePolicy'));
const AccessibilityStatement = lazy(
  () => import('containers/AccessibilityStatement')
);
const CustomPageShow = lazy(() => import('containers/CustomPageShow'));

const PasswordRecovery = lazy(() => import('containers/PasswordRecovery'));
const PasswordReset = lazy(() => import('containers/PasswordReset'));
const SubscriptionEndedPage = lazy(
  () => import('containers/SubscriptionEndedPage')
);
const EmailSettingsPage = lazy(() => import('containers/EmailSettingsPage'));

const ReportPrintPage = lazy(
  () => import('containers/Admin/reporting/containers/PrintReport')
);
const IdeasFeedPage = lazy(() => import('containers/IdeasFeedPage'));
const DisabledAccount = lazy(() => import('containers/DisabledAccount'));

const ProjectPreviewToken = lazy(
  () => import('containers/Admin/projects/project/previewToken')
);

// TODO: Replace with proper route types after migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteType = any;

// Root search schema — SSO/auth callback params that can appear on any route
const rootSearchSchema = yup.object({
  verification_error: yup.string(),
  authentication_error: yup.string(),
  sso_success: yup.string(),
  verification_success: yup.string(),
  sso_flow: yup.string().oneOf(['signup', 'signin']),
  sso_verification_action: yup.string(),
  sso_verification_id: yup.string(),
  sso_verification_type: yup.string(),
  error_code: yup.string(),
});

export type RootSearchParams = yup.InferType<typeof rootSearchSchema>;

// Root route
const rootRoute = createRootRoute({
  validateSearch: (search: Record<string, unknown>): RootSearchParams =>
    rootSearchSchema.validateSync(search),
  component: () => (
    <App>
      <Outlet />
      <TanStackRouterDevtools />
    </App>
  ),
});

// Locale route - parent for all citizen routes
export const localeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$locale',
  component: Outlet,
});

// Index route (home page)
const homeRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

// Auth routes
const signInAdminRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'sign-in/admin',
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

const signInRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'sign-in',
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

const signUpRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'sign-up',
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

const inviteRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'invite',
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

// Site map
const siteMapRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'site-map',
  component: () => (
    <PageLoading>
      <SiteMap />
    </PageLoading>
  ),
});

// Profile routes
const profileEditRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'profile/edit',
  component: () => (
    <PageLoading>
      <UsersEditPage />
    </PageLoading>
  ),
});

const changePasswordRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'profile/change-password',
  component: () => (
    <PageLoading>
      <PasswordChange />
    </PageLoading>
  ),
});

const changeEmailRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'profile/change-email',
  component: () => (
    <PageLoading>
      <EmailChange />
    </PageLoading>
  ),
});

// Ideas routes
const ideasEditRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'ideas/edit/$ideaId',
  component: () => (
    <PageLoading>
      <IdeasEditPage />
    </PageLoading>
  ),
});

const ideasIndexSearchSchema = yup.object({
  sort: yup
    .string()
    .oneOf<IdeaSortMethod>([
      'trending',
      'comments_count',
      'random',
      'popular',
      'new',
      '-new',
    ])
    .default('trending'),
  search: yup.string().optional(),
  idea_status: yup
    .string()
    .oneOf<InputStatusCode>([
      'prescreening',
      'proposed',
      'viewed',
      'under_consideration',
      'accepted',
      'rejected',
      'implemented',
      'custom',
      'threshold_reached',
      'expired',
      'answered',
      'ineligible',
    ])
    .optional(),
  topics: yup
    .array()
    .of(yup.string().required())
    .optional()
    .transform((_value, originalValue) => {
      if (typeof originalValue === 'string') {
        try {
          return JSON.parse(originalValue);
        } catch {
          return undefined;
        }
      }
      return undefined;
    }),
});

export type IdeasIndexSearchParams = {
  sort: IdeaSortMethod;
  search?: string;
  idea_status?: InputStatusCode;
  topics?: string[];
};

const ideasIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'ideas',
  validateSearch: (search: Record<string, unknown>): IdeasIndexSearchParams =>
    ideasIndexSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <IdeasIndexPage />
    </PageLoading>
  ),
});

const ideasShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'ideas/$slug',
  component: () => (
    <PageLoading>
      <IdeasShowPage />
    </PageLoading>
  ),
});

// Project idea/survey new routes
const projectIdeaNewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug/ideas/new',
  component: () => (
    <PageLoading>
      <IdeasNewPage />
    </PageLoading>
  ),
});

const projectSurveyNewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug/surveys/new',
  component: () => (
    <PageLoading>
      <IdeasNewSurveyPage />
    </PageLoading>
  ),
});

// Project preview routes
const projectPreviewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug/preview',
  component: Outlet,
});

const projectPreviewTokenRoute = createRoute({
  getParentRoute: () => projectPreviewRoute,
  path: '$token',
  component: () => (
    <PageLoading>
      <ProjectPreviewToken />
    </PageLoading>
  ),
});

// Projects routes
const projectsIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects',
  component: () => (
    <PageLoading>
      <ProjectsIndexPage />
    </PageLoading>
  ),
});

const projectShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug',
  component: Outlet,
});

const projectShowIndexRoute = createRoute({
  getParentRoute: () => projectShowRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <ProjectsShowPage />
    </PageLoading>
  ),
});

const projectPhaseRoute = createRoute({
  getParentRoute: () => projectShowRoute,
  path: '$phaseNumber',
  component: () => (
    <PageLoading>
      <ProjectsShowPage />
    </PageLoading>
  ),
});

// Ideas feed route
const projectIdeasFeedRoute = createRoute({
  getParentRoute: () => projectShowRoute,
  path: 'ideas-feed',
  component: () => (
    <PageLoading>
      <IdeasFeedPage />
    </PageLoading>
  ),
});

// Folders route
const foldersShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'folders/$slug',
  component: () => (
    <PageLoading>
      <ProjectFolderShowPage />
    </PageLoading>
  ),
});

// Events routes
const eventsIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'events',
  component: () => (
    <PageLoading>
      <EventsPage />
    </PageLoading>
  ),
});

const eventShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'events/$eventId',
  component: () => (
    <PageLoading>
      <EventsShowPage />
    </PageLoading>
  ),
});

// Pages routes
const cookiePolicyRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'pages/cookie-policy',
  component: () => (
    <PageLoading>
      <CookiePolicy />
    </PageLoading>
  ),
});

const accessibilityStatementRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'pages/accessibility-statement',
  component: () => (
    <PageLoading>
      <AccessibilityStatement />
    </PageLoading>
  ),
});

const customPageRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'pages/$slug',
  component: () => (
    <PageLoading>
      <CustomPageShow />
    </PageLoading>
  ),
});

// Auth/misc routes
const passwordRecoveryRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'password-recovery',
  component: () => (
    <PageLoading>
      <PasswordRecovery />
    </PageLoading>
  ),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'reset-password',
  component: () => (
    <PageLoading>
      <PasswordReset />
    </PageLoading>
  ),
});

const subscriptionEndedRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'subscription-ended',
  component: () => (
    <PageLoading>
      <SubscriptionEndedPage />
    </PageLoading>
  ),
});

const emailSettingsRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'email-settings',
  component: () => (
    <PageLoading>
      <EmailSettingsPage />
    </PageLoading>
  ),
});

const reportPrintRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'admin/reporting/report-builder/$reportId/print',
  component: () => (
    <PageLoading>
      <ReportPrintPage />
    </PageLoading>
  ),
});

const disabledAccountRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'disabled-account',
  component: () => (
    <PageLoading>
      <DisabledAccount />
    </PageLoading>
  ),
});

// Build the route tree
const buildRouteTree = (moduleRoutes: Partial<Routes> = {}) =>
  rootRoute.addChildren([
    localeRoute.addChildren([
      homeRoute,
      signInAdminRoute,
      signInRoute,
      signUpRoute,
      inviteRoute,
      siteMapRoute,
      profileEditRoute,
      changePasswordRoute,
      changeEmailRoute,
      createUserShowPageRoutes(),
      ideasEditRoute,
      ideasIndexRoute,
      ideasShowRoute,
      projectIdeaNewRoute,
      projectSurveyNewRoute,
      projectPreviewRoute.addChildren([projectPreviewTokenRoute]),
      projectsIndexRoute,
      projectShowRoute.addChildren([
        projectShowIndexRoute,
        projectPhaseRoute,
        projectIdeasFeedRoute,
      ]),
      foldersShowRoute,
      eventsIndexRoute,
      eventShowRoute,
      cookiePolicyRoute,
      accessibilityStatementRoute,
      customPageRoute,
      passwordRecoveryRoute,
      resetPasswordRoute,
      subscriptionEndedRoute,
      emailSettingsRoute,
      reportPrintRoute,
      disabledAccountRoute,
      createAdminRoutes(moduleRoutes),
    ]),
  ]);

// Create and export the router.
// createAppRouter is called from root.tsx so that module routes can be
// injected without creating a circular dependency.
export const createAppRouter = (moduleRoutes: Partial<Routes> = {}) =>
  createRouter({ routeTree: buildRouteTree(moduleRoutes) });

export let router = createAppRouter();

export const initRouter = (moduleRoutes: Partial<Routes> = {}) => {
  router = createAppRouter(moduleRoutes);
};

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}

// Legacy format for analytics modules (matomo, impact_tracking)
// TODO: Remove after migrating analytics to use TanStack Router
export default function createRoutes() {
  return [
    {
      path: '/$locale',
      children: [
        { path: '' },
        { path: 'sign-in' },
        { path: 'sign-up' },
        { path: 'sign-in/admin' },
        { path: 'invite' },
        { path: 'site-map' },
        { path: 'profile/edit' },
        { path: 'profile/change-password' },
        { path: 'profile/change-email' },
        {
          path: 'profile/$userSlug',
          children: [
            { path: 'submissions' },
            { path: 'surveys' },
            { path: 'comments' },
            { path: 'following' },
            { path: 'events' },
          ],
        },
        { path: 'ideas' },
        { path: 'ideas/$slug' },
        { path: 'ideas/edit/$ideaId' },
        { path: 'projects' },
        {
          path: 'projects/$slug',
          children: [{ path: '' }, { path: '$phaseNumber' }],
        },
        { path: 'projects/$slug/ideas/new' },
        { path: 'projects/$slug/surveys/new' },
        { path: 'projects/$slug/preview/$token' },
        { path: 'folders/$slug' },
        { path: 'events' },
        { path: 'events/$eventId' },
        { path: 'pages/cookie-policy' },
        { path: 'pages/accessibility-statement' },
        { path: 'pages/$slug' },
        { path: 'password-recovery' },
        { path: 'reset-password' },
        { path: 'subscription-ended' },
        { path: 'email-settings' },
        { path: 'disabled-account' },
        { path: 'admin/*' },
      ],
    },
  ];
}
