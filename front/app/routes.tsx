import React, { lazy } from 'react';

import moduleConfiguration, { ModuleRouteTypes } from 'modules';

import createAdminRoutes, { AdminRouteTypes } from 'containers/Admin/routes';
import userProfileRoutes, {
  UserShowPageRouteTypes,
} from 'containers/UsersShowPage/routes';

import PageLoading from 'components/UI/PageLoading';

const HomePage = lazy(() => import('containers/HomePage'));
const SiteMap = lazy(() => import('containers/SiteMap'));
const UsersEditPage = lazy(() => import('containers/UsersEditPage'));
const PasswordChange = lazy(() => import('containers/PasswordChange'));
const EmailChange = lazy(() => import('containers/EmailChange'));
const IdeasEditPage = lazy(() => import('containers/IdeasEditPage'));
const IdeasIndexPage = lazy(() => import('containers/IdeasIndexPage'));
const IdeasShowPage = lazy(() => import('containers/IdeasShowPage'));
const InitiativesIndexPage = lazy(
  () => import('containers/InitiativesIndexPage')
);
const InitiativesEditPage = lazy(
  () => import('containers/InitiativesEditPage')
);
const InitiativesNewPage = lazy(() => import('containers/InitiativesNewPage'));
const InitiativesShowPage = lazy(
  () => import('containers/InitiativesShowPage')
);
const IdeasNewPage = lazy(() => import('containers/IdeasNewPage'));
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

export type RouteType =
  | AdminRouteTypes
  | ModuleRouteTypes
  | UserShowPageRouteTypes
  | CitizenRouteTypes;

export enum CitizenRoutes {
  locale = '/:locale',
  profile = 'profile',
  signIn = 'sign-in',
  signUp = 'sign-up',
  invite = 'invite',
  completeSignUp = 'complete-signup',
  authenticationError = 'authentication-error',
  siteMap = 'site-map',
  profileEdit = `profile/edit`,
  changePassword = `profile/change-password`,
  changeEmail = `profile/change-email`,
  ideas = 'ideas',
  ideasEditIdea = `$ideas/edit/:ideaId`,
  ideasSlug = `idea/:slug`,
  initiatives = 'initiatives',
  initiativeEdit = `initiatives/edit/:initiativeId`,
  initiativesNew = `initiatives/new`,
  initiativesSlug = `initiatives/:slug`,
  projects = 'projects',
  projectIdeaNew = `projects/:slug/ideas/new`,
  projectSlug = `projects/:slug`,
  phaseNumber = ':phaseNumber',
  folders = 'folders',
  foldersSlug = `folders/:slug`,
  wildcard = '*',
  events = 'events',
  eventId = `events/:eventId`,
  pages = 'pages',
  cookiePolicy = `pages/cookie-policy`,
  AccessibilityStatement = `pages/accessibility-statement`,
  customPage = `pages/:slug`,
  passwordRecovery = 'password-recovery',
  resetPassword = 'reset-password',
  subscriptionEnded = 'subscription-ended',
  emailSettings = 'email-settings',
  disabledAccount = 'disabled-account',
  reportPrintPage = `admin/reporting/report-builder/:reportId/print`,
}

type CitizenRouteTypes =
  | `/${string}/`
  | `sign-in`
  | `sign-up`
  | `invite`
  | `complete-signup`
  | `authentication-error`
  | `site-map`
  | `${CitizenRoutes.profile}/edit`
  | `${CitizenRoutes.profile}/change-password`
  | `${CitizenRoutes.profile}/change-email`
  | `ideas`
  | `${CitizenRoutes.ideas}/edit/${string}`
  | `${CitizenRoutes.ideas}/${string}`
  | `initiatives`
  | `${CitizenRoutes.initiatives}/edit/${string}`
  | `${CitizenRoutes.initiatives}/new`
  | `${CitizenRoutes.initiatives}/${string}`
  | `${CitizenRoutes.projects}`
  | `${CitizenRoutes.projects}/${string}/${CitizenRoutes.ideas}/new`
  | `${CitizenRoutes.projects}/${string}`
  | `${CitizenRoutes.folders}`
  | `${CitizenRoutes.folders}/${string}`
  | `${CitizenRoutes.events}`
  | `${CitizenRoutes.events}/${string}`
  | `${CitizenRoutes.pages}`
  | `${CitizenRoutes.pages}/cookie-policy`
  | `${CitizenRoutes.pages}/accessibility-statement`
  | `${CitizenRoutes.pages}/${string}`
  | `${CitizenRoutes.passwordRecovery}`
  | `${CitizenRoutes.resetPassword}`
  | `${CitizenRoutes.subscriptionEnded}`
  | `${CitizenRoutes.emailSettings}`
  | `${CitizenRoutes.disabledAccount}`
  | `admin/reporting/report-builder/${string}/print`;

export default function createRoutes() {
  return [CitizenRoutesObject];
}

const CitizenRoutesObject = {
  path: CitizenRoutes.locale,
  children: [
    {
      index: true,
      element: (
        <PageLoading>
          <HomePage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.signIn,
      element: (
        <PageLoading>
          <HomePage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.signUp,
      element: (
        <PageLoading>
          <HomePage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.invite,
      element: (
        <PageLoading>
          <HomePage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.completeSignUp,
      element: (
        <PageLoading>
          <HomePage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.authenticationError,
      element: (
        <PageLoading>
          <HomePage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.siteMap,
      element: (
        <PageLoading>
          <SiteMap />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.profileEdit,
      element: (
        <PageLoading>
          <UsersEditPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.changePassword,
      element: (
        <PageLoading>
          <PasswordChange />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.changeEmail,
      element: (
        <PageLoading>
          <EmailChange />
        </PageLoading>
      ),
    },
    userProfileRoutes(),
    {
      path: CitizenRoutes.ideasEditIdea,
      element: (
        <PageLoading>
          <IdeasEditPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.ideas,
      element: (
        <PageLoading>
          <IdeasIndexPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.ideasSlug,
      element: (
        <PageLoading>
          <IdeasShowPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.initiatives,
      element: (
        <PageLoading>
          <InitiativesIndexPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.initiativeEdit,
      element: (
        <PageLoading>
          <InitiativesEditPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.initiativesNew,
      element: (
        <PageLoading>
          <InitiativesNewPage />
        </PageLoading>
      ),
    },
    // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
    {
      path: CitizenRoutes.initiativesSlug,
      element: (
        <PageLoading>
          <InitiativesShowPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.projectIdeaNew,
      element: (
        <PageLoading>
          <IdeasNewPage />
        </PageLoading>
      ),
    },
    createAdminRoutes(),
    {
      path: CitizenRoutes.projects,
      element: (
        <PageLoading>
          <ProjectsIndexPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.projectSlug,
      element: (
        <PageLoading>
          <ProjectsShowPage />
        </PageLoading>
      ),
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <ProjectsShowPage />
            </PageLoading>
          ),
        },
        {
          path: CitizenRoutes.phaseNumber,
          element: (
            <PageLoading>
              <ProjectsShowPage />
            </PageLoading>
          ),
        },
        {
          path: CitizenRoutes.wildcard,
          element: (
            <PageLoading>
              <ProjectsShowPage />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: CitizenRoutes.foldersSlug,
      element: (
        <PageLoading>
          <ProjectFolderShowPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.events,
      element: (
        <PageLoading>
          <EventsPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.eventId,
      element: (
        <PageLoading>
          <EventsShowPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.cookiePolicy,
      element: (
        <PageLoading>
          <CookiePolicy />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.AccessibilityStatement,
      element: (
        <PageLoading>
          <AccessibilityStatement />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.customPage,
      element: (
        <PageLoading>
          <CustomPageShow />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.passwordRecovery,
      element: (
        <PageLoading>
          <PasswordRecovery />
        </PageLoading>
      ),
    },
    {
      // Used as link in email received for password recovery
      path: CitizenRoutes.resetPassword,
      element: (
        <PageLoading>
          <PasswordReset />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.subscriptionEnded,
      element: (
        <PageLoading>
          <SubscriptionEndedPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.emailSettings,
      element: (
        <PageLoading>
          <EmailSettingsPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.reportPrintPage,
      element: (
        <PageLoading>
          <ReportPrintPage />
        </PageLoading>
      ),
    },
    {
      path: CitizenRoutes.disabledAccount,
      element: (
        <PageLoading>
          <DisabledAccount />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes.citizen,
  ],
};
