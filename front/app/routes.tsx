import React, { lazy } from 'react';
import Loading from 'components/UI/Loading';
import createAdminRoutes from 'containers/Admin/routes';
import moduleConfiguration from 'modules';

const LandingPage = lazy(() => import('containers/LandingPage'));
const SignUpInPage = lazy(() => import('containers/SignUpInPage'));
const SiteMap = lazy(() => import('containers/SiteMap'));
const UsersEditPage = lazy(() => import('containers/UsersEditPage'));
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
const EventsPage = lazy(() => import('containers/EventsPage'));
const CookiePolicy = lazy(() => import('containers/CookiePolicy'));
const AccessibilityStatement = lazy(
  () => import('containers/AccessibilityStatement')
);
const PagesShowPage = lazy(() => import('containers/PagesShowPage'));
const PasswordRecovery = lazy(() => import('containers/PasswordRecovery'));
const PasswordReset = lazy(() => import('containers/PasswordReset'));
const SubscriptionEndedPage = lazy(
  () => import('containers/SubscriptionEndedPage')
);
const EmailSettingsPage = lazy(() => import('containers/EmailSettingsPage'));

export default function createRoutes() {
  return [
    {
      path: '/:locale',
      children: [
        {
          index: true,
          element: (
            <Loading>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'sign-in',
          element: (
            <Loading>
              <SignUpInPage />
            </Loading>
          ),
        },
        {
          path: 'sign-up',
          element: (
            <Loading>
              <SignUpInPage />
            </Loading>
          ),
        },
        {
          path: 'invite',
          element: (
            <Loading>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'complete-signup',
          element: (
            <Loading>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'authentication-error',
          element: (
            <Loading>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'site-map',
          element: (
            <Loading>
              <SiteMap />
            </Loading>
          ),
        },
        {
          path: 'profile/edit',
          element: (
            <Loading>
              <UsersEditPage />
            </Loading>
          ),
        },
        {
          path: 'profile/:userSlug',
          element: (
            <Loading>
              <UsersShowPage />
            </Loading>
          ),
        },
        {
          path: 'ideas/edit/:ideaId',
          element: (
            <Loading>
              <IdeasEditPage />
            </Loading>
          ),
        },
        {
          path: 'ideas',
          element: (
            <Loading>
              <IdeasIndexPage />
            </Loading>
          ),
        },
        {
          path: 'ideas/:slug',
          element: (
            <Loading>
              <IdeasShowPage />
            </Loading>
          ),
        },
        {
          path: 'initiatives',
          element: (
            <Loading>
              <InitiativesIndexPage />
            </Loading>
          ),
        },
        {
          path: 'initiatives/edit/:initiativeId',
          element: (
            <Loading>
              <InitiativesEditPage />
            </Loading>
          ),
        },
        {
          path: 'initiatives/new',
          element: (
            <Loading>
              <InitiativesNewPage />
            </Loading>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: 'initiatives/:slug',
          element: (
            <Loading>
              <InitiativesShowPage />
            </Loading>
          ),
        },
        {
          path: 'projects/:slug/ideas/new',
          element: (
            <Loading>
              <IdeasNewPage />
            </Loading>
          ),
        },
        createAdminRoutes(),
        {
          path: 'projects',
          element: (
            <Loading>
              <ProjectsIndexPage />
            </Loading>
          ),
        },
        {
          path: 'projects/:slug',
          element: (
            <Loading>
              <ProjectsShowPage />
            </Loading>
          ),
          children: [
            {
              index: true,
              element: (
                <Loading>
                  <ProjectsShowPage />
                </Loading>
              ),
            },
            {
              path: ':phaseNumber',
              element: (
                <Loading>
                  <ProjectsShowPage />
                </Loading>
              ),
            },
            {
              path: '*',
              element: (
                <Loading>
                  <ProjectsShowPage />
                </Loading>
              ),
            },
          ],
        },
        {
          path: 'events',
          element: (
            <Loading>
              <EventsPage />
            </Loading>
          ),
        },
        {
          path: 'pages/cookie-policy',
          element: (
            <Loading>
              <CookiePolicy />
            </Loading>
          ),
        },
        {
          path: 'pages/accessibility-statement',
          element: (
            <Loading>
              <AccessibilityStatement />
            </Loading>
          ),
        },
        {
          path: 'pages/:slug',
          element: (
            <Loading>
              <PagesShowPage />
            </Loading>
          ),
        },
        {
          path: 'password-recovery',
          element: (
            <Loading>
              <PasswordRecovery />
            </Loading>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: 'reset-password',
          element: (
            <Loading>
              <PasswordReset />
            </Loading>
          ),
        },
        {
          path: 'subscription-ended',
          element: (
            <Loading>
              <SubscriptionEndedPage />
            </Loading>
          ),
        },
        {
          path: 'email-settings',
          element: (
            <Loading>
              <EmailSettingsPage />
            </Loading>
          ),
        },
        ...moduleConfiguration.routes.citizen,
        {
          path: '*',
          element: (
            <Loading>
              <PagesShowPage />
            </Loading>
          ),
        },
      ],
    },
  ];
}
