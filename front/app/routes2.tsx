import React, { lazy } from 'react';

import moduleConfiguration from 'modules';

import createAdminRoutes from 'containers/Admin/routes';
import userProfileRoutes from 'containers/UsersShowPage/routes';

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
  locale = '/$locale',
  profile = 'profile',
  signIn = 'sign-in',
  signUp = 'sign-up',
  signInAdmin = 'sign-in/admin',
  invite = 'invite',
  siteMap = 'site-map',
  profileEdit = `profile/edit`,
  changePassword = `profile/change-password`,
  changeEmail = `profile/change-email`,
  ideas = 'ideas',
  ideasEditIdea = `ideas/edit/$ideaId`,
  ideasSlug = `ideas/$slug`,
  projects = 'projects',
  projectIdeaNew = `projects/$slug/ideas/new`,
  projectSurveyNew = `projects/$slug/surveys/new`,
  projectSlug = `projects/$slug`,
  projectSlugPreview = `projects/$slug/preview`,
  projectSlugPreviewToken = `$token`,
  phaseNumber = '$phaseNumber',
  folders = 'folders',
  foldersSlug = `folders/$slug`,
  wildcard = '*',
  events = 'events',
  eventId = `events/$eventId`,
  pages = 'pages',
  cookiePolicy = `pages/cookie-policy`,
  AccessibilityStatement = `pages/accessibility-statement`,
  customPage = `pages/$slug`,
  passwordRecovery = 'password-recovery',
  resetPassword = 'reset-password',
  subscriptionEnded = 'subscription-ended',
  emailSettings = 'email-settings',
  disabledAccount = 'disabled-account',
  reportPrintPage = `admin/reporting/report-builder/$reportId/print`,
}

export default function createRoutes() {
  return [
    {
      path: citizenRoutes.locale,
      children: [
        {
          index: true,
          component: () => (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.signInAdmin,
          component: () => (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.signIn,
          component: () => (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.signUp,
          component: () => (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.invite,
          component: () => (
            <PageLoading>
              <HomePage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.siteMap,
          component: () => (
            <PageLoading>
              <SiteMap />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.profileEdit,
          component: () => (
            <PageLoading>
              <UsersEditPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.changePassword,
          component: () => (
            <PageLoading>
              <PasswordChange />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.changeEmail,
          component: () => (
            <PageLoading>
              <EmailChange />
            </PageLoading>
          ),
        },
        userProfileRoutes(),
        {
          path: citizenRoutes.ideasEditIdea,
          component: () => (
            <PageLoading>
              <IdeasEditPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.ideas,
          component: () => (
            <PageLoading>
              <IdeasIndexPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.ideasSlug,
          component: () => (
            <PageLoading>
              <IdeasShowPage />
            </PageLoading>
          ),
        },

        {
          path: citizenRoutes.projectIdeaNew,
          component: () => (
            <PageLoading>
              <IdeasNewPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.projectSurveyNew,
          component: () => (
            <PageLoading>
              <IdeasNewSurveyPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.projectSlugPreview,
          children: [
            {
              path: citizenRoutes.projectSlugPreviewToken,
              component: () => (
                <PageLoading>
                  <ProjectPreviewToken />
                </PageLoading>
              ),
            },
          ],
        },

        createAdminRoutes(),
        {
          path: citizenRoutes.projects,
          component: () => (
            <PageLoading>
              <ProjectsIndexPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.projectSlug,
          component: () => (
            <PageLoading>
              <ProjectsShowPage />
            </PageLoading>
          ),
          children: [
            {
              index: true,
              component: () => (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
            {
              path: citizenRoutes.phaseNumber,
              component: () => (
                <PageLoading>
                  <ProjectsShowPage />
                </PageLoading>
              ),
            },
          ],
        },
        {
          path: citizenRoutes.foldersSlug,
          component: () => (
            <PageLoading>
              <ProjectFolderShowPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.events,
          component: () => (
            <PageLoading>
              <EventsPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.eventId,
          component: () => (
            <PageLoading>
              <EventsShowPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.cookiePolicy,
          component: () => (
            <PageLoading>
              <CookiePolicy />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.AccessibilityStatement,
          component: () => (
            <PageLoading>
              <AccessibilityStatement />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.customPage,
          component: () => (
            <PageLoading>
              <CustomPageShow />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.passwordRecovery,
          component: () => (
            <PageLoading>
              <PasswordRecovery />
            </PageLoading>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: citizenRoutes.resetPassword,
          component: () => (
            <PageLoading>
              <PasswordReset />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.subscriptionEnded,
          component: () => (
            <PageLoading>
              <SubscriptionEndedPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.emailSettings,
          component: () => (
            <PageLoading>
              <EmailSettingsPage />
            </PageLoading>
          ),
        },
        // Should not be in citizenRoutes, but in adminRoutes
        {
          path: citizenRoutes.reportPrintPage,
          component: () => (
            <PageLoading>
              <ReportPrintPage />
            </PageLoading>
          ),
        },
        {
          path: citizenRoutes.disabledAccount,
          component: () => (
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
