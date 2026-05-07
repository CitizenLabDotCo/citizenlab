import React, { lazy } from 'react';

import {
  createRoute,
  createRootRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as yup from 'yup';

import {
  IdeaSortMethod,
  ideaSortMethods,
  presentationModes,
} from 'api/phases/types';

import { createAdminRoutes } from 'containers/Admin/routes';
import App from 'containers/App';
import { createUserShowPageRoutes } from 'containers/UsersShowPage/routes';

import PageLoading from 'components/UI/PageLoading';

import { permissiveOneOf } from 'utils/cl-router/permissiveOneOf';
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
  // Super admin can be multiple possible params (as people forget the exact one)
  super_admin: yup.string().optional(),
  'super-admin': yup.string().optional(),
  superadmin: yup.string().optional(),
  super_user: yup.string().optional(),
  // Cookie consent params
  from: yup.string().optional(),
  'yes-I-accept-cookies': yup.string().optional(),
  // Phase context (used by sharing buttons, idea cards)
  phase_context: yup.string().optional(),
  // SSO provider testing param
  provider: yup.string().optional(),
  // Used by IdeaCard across many routes to scroll to a specific card
  scroll_to_card: yup.string().optional(),
  // Used by vote inputs after auth flow completes
  processing_vote: yup.string().optional(),
  // Used by project cards topbar to auto-focus search
  focusSearch: yup.string().optional(),
  // Used by LocationInput to pre-fill map coordinates (idea forms, survey forms, admin events)
  lat: yup.number().optional(),
  lng: yup.number().optional(),
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
const ideasEditSearchSchema = yup.object({
  idea_id: yup.string().optional(),
  selected_idea_id: yup.string().optional(),
});

const ideasEditRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'ideas/edit/$ideaId',
  validateSearch: (search: Record<string, unknown>) =>
    ideasEditSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <IdeasEditPage />
    </PageLoading>
  ),
});

const ideasIndexSearchSchema = yup.object({
  sort: permissiveOneOf(ideaSortMethods).default('trending'),
  search: yup.string().optional(),
  idea_status: yup.string().optional(),
  topics: yup.array().of(yup.string().required()).optional(),
  idea_map_id: yup.string().optional(),
  view: yup.string().oneOf(presentationModes).optional(),
});

export type IdeasIndexSearchParams = {
  sort: IdeaSortMethod;
  search?: string;
  idea_status?: string;
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

const ideasShowSearchSchema = yup.object({
  phase_context: yup.string().optional(),
  go_back: yup.string().optional(),
  new_idea_id: yup.string().optional(),
});

type IdeasShowSearchParams = yup.InferType<typeof ideasShowSearchSchema>;

const ideasShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'ideas/$slug',
  validateSearch: (search: Record<string, unknown>): IdeasShowSearchParams =>
    ideasShowSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <IdeasShowPage />
    </PageLoading>
  ),
});

// Project idea/survey new routes
const projectIdeaNewSearchSchema = yup.object({
  phase_id: yup.string().optional(),
  idea_id: yup.string().optional(),
  selected_idea_id: yup.string().optional(),
  lat: yup.number().optional(),
  lng: yup.number().optional(),
});

const projectIdeaNewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug/ideas/new',
  validateSearch: (search: Record<string, unknown>) =>
    projectIdeaNewSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <IdeasNewPage />
    </PageLoading>
  ),
});

const projectSurveyNewSearchSchema = yup.object({
  phase_id: yup.string().optional(),
  idea_id: yup.string().optional(),
});

type ProjectSurveyNewSearchParams = yup.InferType<
  typeof projectSurveyNewSearchSchema
>;

const projectSurveyNewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug/surveys/new',
  validateSearch: (
    search: Record<string, unknown>
  ): ProjectSurveyNewSearchParams =>
    projectSurveyNewSearchSchema.validateSync(search, { stripUnknown: true }),
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

const projectShowSearchSchema = yup.object({
  show_modal: yup.string().optional(),
  phase_id: yup.string().optional(),
  new_idea_id: yup.string().optional(),
  tab: yup.string().oneOf(['statements', 'results']).optional(),
  scrollToStatusModule: yup.string().optional(),
  scrollToIdeas: yup.string().optional(),
  sort: yup.string().oneOf(ideaSortMethods).optional(),
  search: yup.string().optional(),
  topics: yup.array().of(yup.string().required()).optional(),
  idea_status: yup.string().optional(),
  idea_map_id: yup.string().optional(),
  view: yup.string().oneOf(presentationModes).optional(),
});

const projectShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'projects/$slug',
  validateSearch: (search: Record<string, unknown>) =>
    projectShowSearchSchema.validateSync(search, { stripUnknown: true }),
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
const ideasFeedSearchSchema = yup.object({
  phase_id: yup.string().optional(),
  initial_idea_id: yup.string().optional(),
  topic: yup.string().optional(),
  subtopic: yup.string().optional(),
  sheet_open: yup.string().oneOf(['true']).optional(),
  idea_id: yup.string().optional(),
});

const projectIdeasFeedRoute = createRoute({
  getParentRoute: () => projectShowRoute,
  path: 'ideas-feed',
  validateSearch: (search: Record<string, unknown>) =>
    ideasFeedSearchSchema.validateSync(search, { stripUnknown: true }),
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
const eventsIndexSearchSchema = yup.object({
  ongoing_events_project_ids: yup
    .array()
    .of(yup.string().required())
    .optional(),
  past_events_project_ids: yup.array().of(yup.string().required()).optional(),
  ongoing_page: yup.number().optional(),
  past_page: yup.number().optional(),
  time_period: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(['today', 'week', 'month', 'all'] as const)
        .required()
    )
    .optional(),
});

export type EventsIndexSearchParams = yup.InferType<
  typeof eventsIndexSearchSchema
>;

const eventsIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'events',
  validateSearch: (search: Record<string, unknown>): EventsIndexSearchParams =>
    eventsIndexSearchSchema.validateSync(search, { stripUnknown: true }),
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
const cookiePolicySearchSchema = yup.object({
  from: yup.string().optional(),
});
type CookiePolicySearchParams = yup.InferType<typeof cookiePolicySearchSchema>;

const cookiePolicyRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'pages/cookie-policy',
  validateSearch: (search: Record<string, unknown>): CookiePolicySearchParams =>
    cookiePolicySearchSchema.validateSync(search, { stripUnknown: true }),
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

const emailSettingsSearchSchema = yup.object({
  unsubscription_token: yup.string().optional(),
  campaign_id: yup.string().optional(),
});

const emailSettingsRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'email-settings',
  validateSearch: (search: Record<string, unknown>) =>
    emailSettingsSearchSchema.validateSync(search, { stripUnknown: true }),
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

const disabledAccountSearchSchema = yup.object({
  date: yup.string().optional(),
});

const disabledAccountRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: 'disabled-account',
  validateSearch: (search: Record<string, unknown>) =>
    disabledAccountSearchSchema.validateSync(search, { stripUnknown: true }),
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
  createRouter({
    routeTree: buildRouteTree(moduleRoutes),
    trailingSlash: 'preserve',
  });

export let router = createAppRouter();

export const initRouter = (moduleRoutes: Partial<Routes> = {}) => {
  router = createAppRouter(moduleRoutes);
};

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
