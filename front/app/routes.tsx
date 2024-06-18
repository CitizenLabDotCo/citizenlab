import React, { lazy } from 'react';

import moduleConfiguration, { moduleRouteTypes } from 'modules';

import createAdminRoutes, { AdminRouteTypes } from 'containers/Admin/routes';
import userProfileRoutes, {
  userShowPageRouteTypes,
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

export type RouteType =
  | AdminRouteTypes
  | moduleRouteTypes
  | userShowPageRouteTypes
  | citizenRouteTypes
  | ExternalRouteTypes;

type ExternalRouteTypes =
  | `https${string}`
  | `http${string}`
  | `www${string}`
  | `mailto${string}`
  | `tel${string}`;

export enum citizenRoutes {
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
  ideasEditIdea = `ideas/edit/:ideaId`,
  ideasSlug = `ideas/:slug`,
  initiatives = 'initiatives',
  initiativeEdit = `initiatives/edit/:initiativeId`,
  initiativesNew = `initiatives/new`,
  initiativesSlug = `initiatives/:slug`,
  projects = 'projects',
  projectIdeaNew = `projects/:slug/ideas/new`,
  projectSurveyNew = `projects/:slug/surveys/new`,
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

type citizenRouteTypes =
  | '/'
  | `/${string}/`
  | `/sign-in`
  | `/sign-up`
  | `/invite`
  | `/complete-signup`
  | `/authentication-error`
  | `/site-map`
  | `/${citizenRoutes.profile}/edit`
  | `/${citizenRoutes.profile}/change-password`
  | `/${citizenRoutes.profile}/change-email`
  | `/ideas`
  | `/${citizenRoutes.ideas}/edit/${string}`
  | `/${citizenRoutes.ideas}/${string}`
  | `/initiatives`
  | `/${citizenRoutes.initiatives}/edit/${string}`
  | `/${citizenRoutes.initiatives}/new`
  | `/${citizenRoutes.initiatives}/${string}`
  | `/${citizenRoutes.projects}`
  | `/${citizenRoutes.projects}?focusSearch=${string}`
  | `/${citizenRoutes.projects}/${string}/${citizenRoutes.ideas}/new`
  | `/${citizenRoutes.projects}/${string}`
  | `/${citizenRoutes.folders}`
  | `/${citizenRoutes.folders}/${string}`
  | `/${citizenRoutes.events}`
  | `/${citizenRoutes.events}/${string}`
  | `/${citizenRoutes.pages}`
  | `/${citizenRoutes.pages}/cookie-policy`
  | `/${citizenRoutes.pages}/accessibility-statement`
  | `/${citizenRoutes.pages}/${string}`
  | `/${citizenRoutes.passwordRecovery}`
  | `/${citizenRoutes.resetPassword}`
  | `/${citizenRoutes.subscriptionEnded}`
  | `/${citizenRoutes.emailSettings}`
  | `/${citizenRoutes.disabledAccount}?${string}`
  | `/admin/reporting/report-builder/${string}/print`;

export default function createRoutes() {
  return [
    {
      path: citizenRoutes.locale,
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
          path: citizenRoutes.signIn,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.signUp,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.invite,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.completeSignUp,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.authenticationError,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.siteMap,
          element: (
            <PageLoading>
              <SiteMap />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.profileEdit,
          element: (
            <PageLoading>
              <UsersEditPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.changePassword,
          element: (
            <PageLoading>
              <PasswordChange />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.changeEmail,
          element: (
            <PageLoading>
              <EmailChange />
            </PageLoading>
          ),
        },
        userProfileRoutes(),
        {
          path: citizenRoutes.ideasEditIdea,
          element: (
            <PageLoading>
              <IdeasEditPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.ideas,
          element: (
            <PageLoading>
              <IdeasIndexPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.ideasSlug,
          element: (
            <PageLoading>
              <IdeasShowPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.initiatives,
          element: (
            <PageLoading>
              <InitiativesIndexPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.initiativeEdit,
          element: (
            <PageLoading>
              <InitiativesEditPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.initiativesNew,
          element: (
            <PageLoading>
              <InitiativesNewPage />
            </PageLoading>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: citizenRoutes.initiativesSlug,
          element: (
            <PageLoading>
              <InitiativesShowPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.projectIdeaNew,
          element: (
            <PageLoading>
              <IdeasNewPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.projectSurveyNew,
          element: (
            <PageLoading>
              <IdeasNewSurveyPage />
            </PageLoading>
          ),
        },
        createAdminRoutes(),
        {
          path: citizenRoutes.projects,
          element: (
            <PageLoading>
              <ProjectsIndexPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.projectSlug,
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
              path: citizenRoutes.phaseNumber,
              element: (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
            {
              path: citizenRoutes.wildcard,
              element: (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
          ],
        },
        {
          path: citizenRoutes.foldersSlug,
          element: (
            <PageLoading>
              <ProjectFolderShowPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.events,
          element: (
            <PageLoading>
              <EventsPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.eventId,
          element: (
            <PageLoading>
              <EventsShowPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.cookiePolicy,
          element: (
            <PageLoading>
              <CookiePolicy />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.AccessibilityStatement,
          element: (
            <PageLoading>
              <AccessibilityStatement />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.customPage,
          element: (
            <PageLoading>
              <CustomPageShow />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.passwordRecovery,
          element: (
            <PageLoading>
              <PasswordRecovery />
            </PageLoading>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: citizenRoutes.resetPassword,
          element: (
            <PageLoading>
              <PasswordReset />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.subscriptionEnded,
          element: (
            <PageLoading>
              <SubscriptionEndedPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.emailSettings,
          element: (
            <PageLoading>
              <EmailSettingsPage />
            </PageLoading>
          ),
        },
        // Should not be in citizenRoutes, but in adminRoutes
        {
          path: citizenRoutes.reportPrintPage,
          element: (
            <PageLoading>
              <ReportPrintPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.disabledAccount,
          element: (
            <PageLoading>
              <DisabledAccount />
            </PageLoading>
          ),
        },
        ...moduleConfiguration.routes.citizen,
      ],
    },
  ];
}
