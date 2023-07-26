import PageLoading from 'components/UI/PageLoading';
import createAdminRoutes from 'containers/Admin/routes';
import moduleConfiguration from 'modules';
import React, { lazy } from 'react';

const HomePage = lazy(() => import('containers/HomePage'));
const SiteMap = lazy(() => import('containers/SiteMap'));
const UsersEditPage = lazy(() => import('containers/UsersEditPage'));
const PasswordChange = lazy(() => import('containers/PasswordChange'));
const EmailChange = lazy(() => import('containers/EmailChange'));
const UsersShowPage = lazy(() => import('containers/UsersShowPage'));
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

const ReportViewerPage = lazy(
  () => import('containers/Admin/reporting/containers/FullScreenReport')
);
const ReportPrintPage = lazy(
  () => import('containers/Admin/reporting/containers/PrintReport')
);
const DisabledAccount = lazy(() => import('containers/DisabledAccount'));

export default function createRoutes() {
  return [
    {
      path: '/:locale',
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
          path: 'sign-in',
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: 'sign-up',
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: 'invite',
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: 'complete-signup',
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: 'authentication-error',
          element: (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: 'site-map',
          element: (
            <PageLoading>
              <SiteMap />
            </PageLoading>
          ),
        },
        {
          path: 'profile/edit',
          element: (
            <PageLoading>
              <UsersEditPage />
            </PageLoading>
          ),
        },
        {
          path: 'profile/change-password',
          element: (
            <PageLoading>
              <PasswordChange />
            </PageLoading>
          ),
        },
        {
          path: 'profile/change-email',
          element: (
            <PageLoading>
              <EmailChange />
            </PageLoading>
          ),
        },
        {
          path: 'profile/:userSlug',
          element: (
            <PageLoading>
              <UsersShowPage />
            </PageLoading>
          ),
        },
        {
          path: 'ideas/edit/:ideaId',
          element: (
            <PageLoading>
              <IdeasEditPage />
            </PageLoading>
          ),
        },
        {
          path: 'ideas',
          element: (
            <PageLoading>
              <IdeasIndexPage />
            </PageLoading>
          ),
        },
        {
          path: 'ideas/:slug',
          element: (
            <PageLoading>
              <IdeasShowPage />
            </PageLoading>
          ),
        },
        {
          path: 'initiatives',
          element: (
            <PageLoading>
              <InitiativesIndexPage />
            </PageLoading>
          ),
        },
        {
          path: 'initiatives/edit/:initiativeId',
          element: (
            <PageLoading>
              <InitiativesEditPage />
            </PageLoading>
          ),
        },
        {
          path: 'initiatives/new',
          element: (
            <PageLoading>
              <InitiativesNewPage />
            </PageLoading>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: 'initiatives/:slug',
          element: (
            <PageLoading>
              <InitiativesShowPage />
            </PageLoading>
          ),
        },
        {
          path: 'projects/:slug/ideas/new',
          element: (
            <PageLoading>
              <IdeasNewPage />
            </PageLoading>
          ),
        },
        createAdminRoutes(),
        {
          path: 'projects',
          element: (
            <PageLoading>
              <ProjectsIndexPage />
            </PageLoading>
          ),
        },
        {
          path: 'projects/:slug',
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
              path: ':phaseNumber',
              element: (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
            {
              path: '*',
              element: (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
          ],
        },
        {
          path: 'folders/:slug',
          element: (
            <PageLoading>
              <ProjectFolderShowPage />
            </PageLoading>
          ),
        },
        {
          path: 'events',
          element: (
            <PageLoading>
              <EventsPage />
            </PageLoading>
          ),
        },
        {
          path: 'events/:eventId',
          element: (
            <PageLoading>
              <EventsShowPage />
            </PageLoading>
          ),
        },
        {
          path: 'pages/cookie-policy',
          element: (
            <PageLoading>
              <CookiePolicy />
            </PageLoading>
          ),
        },
        {
          path: 'pages/accessibility-statement',
          element: (
            <PageLoading>
              <AccessibilityStatement />
            </PageLoading>
          ),
        },
        {
          path: 'pages/:slug',
          element: (
            <PageLoading>
              <CustomPageShow />
            </PageLoading>
          ),
        },
        {
          path: 'password-recovery',
          element: (
            <PageLoading>
              <PasswordRecovery />
            </PageLoading>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: 'reset-password',
          element: (
            <PageLoading>
              <PasswordReset />
            </PageLoading>
          ),
        },
        {
          path: 'subscription-ended',
          element: (
            <PageLoading>
              <SubscriptionEndedPage />
            </PageLoading>
          ),
        },
        {
          path: 'email-settings',
          element: (
            <PageLoading>
              <EmailSettingsPage />
            </PageLoading>
          ),
        },
        {
          path: 'admin/reporting/report-builder/:reportId/viewer',
          element: (
            <PageLoading>
              <ReportViewerPage />
            </PageLoading>
          ),
        },
        {
          path: 'admin/reporting/report-builder/:reportId/print',
          element: (
            <PageLoading>
              <ReportPrintPage />
            </PageLoading>
          ),
        },
        {
          path: 'disabled-account',
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
