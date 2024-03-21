import React, { lazy } from 'react';

import moduleConfiguration, { ModuleRouteTypes } from 'modules';

import {
  REPORTING,
  REPORT_BUILDER,
  PRINT,
} from 'containers/Admin/reporting/routes';
import createAdminRoutes, { AdminRouteTypes } from 'containers/Admin/routes';
import userProfileRoutes, {
  useShowPageRouteTypes,
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
  | useShowPageRouteTypes
  | mainRouteTypes;

enum mainRoutes {
  locale = '/:locale',
  profile = 'profile',
  signIn = 'sign-in',
  signUp = 'sign-up',
  invite = 'invite',
  completeSignUp = 'complete-signup',
  authenticationError = 'authentication-error',
  siteMap = 'site-map',
  profileEdit = `${profile}/edit`,
  changePassword = `${profile}/change-password`,
  changeEmail = `${profile}/change-email`,
  ideas = 'ideas',
  ideasEditIdea = `${ideas}/edit/:ideaId`,
  ideasSlug = `${ideas}/:slug`,
  initiatives = 'initiatives',
  initiativeEdit = `${initiatives}/edit/:initiativeId`,
  initiativesNew = `${initiatives}/new`,
  initiativesSlug = `${initiatives}/:slug`,
  projects = 'projects',
  projectIdeaNew = `${projects}/:slug/${ideas}/new`,
  projectSlug = `${projects}/:slug`,
  phaseNumber = ':phaseNumber',
  folders = 'folders',
  foldersSlug = `${folders}/:slug`,
  wildcard = '*',
  events = 'events',
  eventId = `${events}/:eventId`,
  pages = 'pages',
  cookiePolicy = `${pages}/cookie-policy`,
  AccessibilityStatement = `${pages}/accessibility-statement`,
  customPage = `${pages}/:slug`,
  passwordRecovery = 'password-recovery',
  resetPassword = 'reset-password',
  subscriptionEnded = 'subscription-ended',
  emailSettings = 'email-settings',
  disabledAccount = 'disabled-account',
  reportPrintPage = `admin/${REPORTING}/${REPORT_BUILDER}/:reportId/${PRINT}`,
}

export type mainRouteTypes =
  | `/${string}/`
  | `sign-in`
  | `sign-up`
  | `invite`
  | `complete-signup`
  | `authentication-error`
  | `site-map`
  | `${mainRoutes.profile}/edit`
  | `${mainRoutes.profile}/change-password`
  | `${mainRoutes.profile}/change-email`
  | `ideas`
  | `${mainRoutes.ideas}/edit/${string}`
  | `${mainRoutes.ideas}/${string}`
  | `initiatives`
  | `${mainRoutes.initiatives}/edit/${string}`
  | `${mainRoutes.initiatives}/new`
  | `${mainRoutes.initiatives}/${string}`
  | `${mainRoutes.projects}`
  | `${mainRoutes.projects}/${string}/${mainRoutes.ideas}/new`
  | `${mainRoutes.projects}/${string}`
  | `${mainRoutes.folders}`
  | `${mainRoutes.folders}/${string}`
  | `${mainRoutes.events}`
  | `${mainRoutes.events}/${string}`
  | `${mainRoutes.pages}`
  | `${mainRoutes.pages}/cookie-policy`
  | `${mainRoutes.pages}/accessibility-statement`
  | `${mainRoutes.pages}/${string}`
  | `${mainRoutes.passwordRecovery}`
  | `${mainRoutes.resetPassword}`
  | `${mainRoutes.subscriptionEnded}`
  | `${mainRoutes.emailSettings}`
  | `${mainRoutes.disabledAccount}`
  | `admin/reporting/report-builder/${string}/print`;

export default function createRoutes() {
  return [
    {
      path: mainRoutes.locale,
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
          path: mainRoutes.signIn,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.signUp,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.invite,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.completeSignUp,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.authenticationError,
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.siteMap,
          element: (
            <PageLoading>
              <SiteMap />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.profileEdit,
          element: (
            <PageLoading>
              <UsersEditPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.changePassword,
          element: (
            <PageLoading>
              <PasswordChange />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.changeEmail,
          element: (
            <PageLoading>
              <EmailChange />
            </PageLoading>
          ),
        },
        userProfileRoutes(),
        {
          path: mainRoutes.ideasEditIdea,
          element: (
            <PageLoading>
              <IdeasEditPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.ideas,
          element: (
            <PageLoading>
              <IdeasIndexPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.ideasSlug,
          element: (
            <PageLoading>
              <IdeasShowPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.initiatives,
          element: (
            <PageLoading>
              <InitiativesIndexPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.initiativeEdit,
          element: (
            <PageLoading>
              <InitiativesEditPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.initiativesNew,
          element: (
            <PageLoading>
              <InitiativesNewPage />
            </PageLoading>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: mainRoutes.initiativesSlug,
          element: (
            <PageLoading>
              <InitiativesShowPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.projectIdeaNew,
          element: (
            <PageLoading>
              <IdeasNewPage />
            </PageLoading>
          ),
        },
        createAdminRoutes(),
        {
          path: mainRoutes.projects,
          element: (
            <PageLoading>
              <ProjectsIndexPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.projectSlug,
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
              path: mainRoutes.phaseNumber,
              element: (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
            {
              path: mainRoutes.wildcard,
              element: (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
          ],
        },
        {
          path: mainRoutes.foldersSlug,
          element: (
            <PageLoading>
              <ProjectFolderShowPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.events,
          element: (
            <PageLoading>
              <EventsPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.eventId,
          element: (
            <PageLoading>
              <EventsShowPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.cookiePolicy,
          element: (
            <PageLoading>
              <CookiePolicy />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.AccessibilityStatement,
          element: (
            <PageLoading>
              <AccessibilityStatement />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.customPage,
          element: (
            <PageLoading>
              <CustomPageShow />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.passwordRecovery,
          element: (
            <PageLoading>
              <PasswordRecovery />
            </PageLoading>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: mainRoutes.resetPassword,
          element: (
            <PageLoading>
              <PasswordReset />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.subscriptionEnded,
          element: (
            <PageLoading>
              <SubscriptionEndedPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.emailSettings,
          element: (
            <PageLoading>
              <EmailSettingsPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.reportPrintPage,
          element: (
            <PageLoading>
              <ReportPrintPage />
            </PageLoading>
          ),
        },
        {
          path: mainRoutes.disabledAccount,
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
