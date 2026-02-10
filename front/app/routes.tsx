import React, { lazy } from 'react';

import {
  createRoute,
  createRootRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { createAdminRoutes } from 'containers/Admin/routes';
import App from 'containers/App';
import { createUserShowPageRoutes } from 'containers/UsersShowPage/routes';

import PageLoading from 'components/UI/PageLoading';

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
const DisabledAccount = lazy(() => import('containers/DisabledAccount'));

const ProjectPreviewToken = lazy(
  () => import('containers/Admin/projects/project/previewToken')
);

export enum citizenRoutes {
  locale = '$locale',
  profile = 'profile',
  signIn = 'sign-in',
  signUp = 'sign-up',
  signInAdmin = 'sign-in/admin',
  invite = 'invite',
  siteMap = 'site-map',
  profileEdit = 'profile/edit',
  changePassword = 'profile/change-password',
  changeEmail = 'profile/change-email',
  ideas = 'ideas',
  ideasEditIdea = 'ideas/edit/$ideaId',
  ideasSlug = 'ideas/$slug',
  projects = 'projects',
  projectIdeaNew = 'projects/$slug/ideas/new',
  projectSurveyNew = 'projects/$slug/surveys/new',
  projectSlug = 'projects/$slug',
  projectSlugPreview = 'projects/$slug/preview',
  projectSlugPreviewToken = '$token',
  phaseNumber = '$phaseNumber',
  folders = 'folders',
  foldersSlug = 'folders/$slug',
  wildcard = '*',
  events = 'events',
  eventId = 'events/$eventId',
  pages = 'pages',
  cookiePolicy = 'pages/cookie-policy',
  AccessibilityStatement = 'pages/accessibility-statement',
  customPage = 'pages/$slug',
  passwordRecovery = 'password-recovery',
  resetPassword = 'reset-password',
  subscriptionEnded = 'subscription-ended',
  emailSettings = 'email-settings',
  disabledAccount = 'disabled-account',
  reportPrintPage = 'admin/reporting/report-builder/$reportId/print',
}

// TODO: Replace with proper route types after migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteType = any;

// Root route
const rootRoute = createRootRoute({
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
  path: citizenRoutes.locale,
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
  path: citizenRoutes.signInAdmin,
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

const signInRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.signIn,
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

const signUpRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.signUp,
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

const inviteRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.invite,
  component: () => (
    <PageLoading>
      <HomePage />
    </PageLoading>
  ),
});

// Site map
const siteMapRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.siteMap,
  component: () => (
    <PageLoading>
      <SiteMap />
    </PageLoading>
  ),
});

// Profile routes
const profileEditRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.profileEdit,
  component: () => (
    <PageLoading>
      <UsersEditPage />
    </PageLoading>
  ),
});

const changePasswordRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.changePassword,
  component: () => (
    <PageLoading>
      <PasswordChange />
    </PageLoading>
  ),
});

const changeEmailRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.changeEmail,
  component: () => (
    <PageLoading>
      <EmailChange />
    </PageLoading>
  ),
});

// Ideas routes
const ideasEditRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.ideasEditIdea,
  component: () => (
    <PageLoading>
      <IdeasEditPage />
    </PageLoading>
  ),
});

const ideasIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.ideas,
  component: () => (
    <PageLoading>
      <IdeasIndexPage />
    </PageLoading>
  ),
});

const ideasShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.ideasSlug,
  component: () => (
    <PageLoading>
      <IdeasShowPage />
    </PageLoading>
  ),
});

// Project idea/survey new routes
const projectIdeaNewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.projectIdeaNew,
  component: () => (
    <PageLoading>
      <IdeasNewPage />
    </PageLoading>
  ),
});

const projectSurveyNewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.projectSurveyNew,
  component: () => (
    <PageLoading>
      <IdeasNewSurveyPage />
    </PageLoading>
  ),
});

// Project preview routes
const projectPreviewRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.projectSlugPreview,
  component: Outlet,
});

const projectPreviewTokenRoute = createRoute({
  getParentRoute: () => projectPreviewRoute,
  path: citizenRoutes.projectSlugPreviewToken,
  component: () => (
    <PageLoading>
      <ProjectPreviewToken />
    </PageLoading>
  ),
});

// Projects routes
const projectsIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.projects,
  component: () => (
    <PageLoading>
      <ProjectsIndexPage />
    </PageLoading>
  ),
});

const projectShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.projectSlug,
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
  path: citizenRoutes.phaseNumber,
  component: () => (
    <PageLoading>
      <ProjectsShowPage />
    </PageLoading>
  ),
});

// Folders route
const foldersShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.foldersSlug,
  component: () => (
    <PageLoading>
      <ProjectFolderShowPage />
    </PageLoading>
  ),
});

// Events routes
const eventsIndexRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.events,
  component: () => (
    <PageLoading>
      <EventsPage />
    </PageLoading>
  ),
});

const eventShowRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.eventId,
  component: () => (
    <PageLoading>
      <EventsShowPage />
    </PageLoading>
  ),
});

// Pages routes
const cookiePolicyRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.cookiePolicy,
  component: () => (
    <PageLoading>
      <CookiePolicy />
    </PageLoading>
  ),
});

const accessibilityStatementRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.AccessibilityStatement,
  component: () => (
    <PageLoading>
      <AccessibilityStatement />
    </PageLoading>
  ),
});

const customPageRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.customPage,
  component: () => (
    <PageLoading>
      <CustomPageShow />
    </PageLoading>
  ),
});

// Auth/misc routes
const passwordRecoveryRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.passwordRecovery,
  component: () => (
    <PageLoading>
      <PasswordRecovery />
    </PageLoading>
  ),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.resetPassword,
  component: () => (
    <PageLoading>
      <PasswordReset />
    </PageLoading>
  ),
});

const subscriptionEndedRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.subscriptionEnded,
  component: () => (
    <PageLoading>
      <SubscriptionEndedPage />
    </PageLoading>
  ),
});

const emailSettingsRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.emailSettings,
  component: () => (
    <PageLoading>
      <EmailSettingsPage />
    </PageLoading>
  ),
});

const reportPrintRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.reportPrintPage,
  component: () => (
    <PageLoading>
      <ReportPrintPage />
    </PageLoading>
  ),
});

const disabledAccountRoute = createRoute({
  getParentRoute: () => localeRoute,
  path: citizenRoutes.disabledAccount,
  component: () => (
    <PageLoading>
      <DisabledAccount />
    </PageLoading>
  ),
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
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
    projectShowRoute.addChildren([projectShowIndexRoute, projectPhaseRoute]),
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
    createAdminRoutes(),
  ]),
]);

// Create and export the router
export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
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
