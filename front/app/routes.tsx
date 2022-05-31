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
            <Loading admin={false}>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'sign-in',
          element: (
            <Loading admin={false}>
              <SignUpInPage />
            </Loading>
          ),
        },
        {
          path: 'sign-up',
          element: (
            <Loading admin={false}>
              <SignUpInPage />
            </Loading>
          ),
        },
        {
          path: 'invite',
          element: (
            <Loading admin={false}>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'complete-signup',
          element: (
            <Loading admin={false}>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'authentication-error',
          element: (
            <Loading admin={false}>
              <LandingPage />
            </Loading>
          ),
        },
        {
          path: 'site-map',
          element: (
            <Loading admin={false}>
              <SiteMap />
            </Loading>
          ),
        },
        {
          path: 'profile/edit',
          element: (
            <Loading admin={false}>
              <UsersEditPage />
            </Loading>
          ),
        },
        {
          path: 'profile/:userSlug',
          element: (
            <Loading admin={false}>
              <UsersShowPage />
            </Loading>
          ),
        },
        {
          path: 'ideas/edit/:ideaId',
          element: (
            <Loading admin={false}>
              <IdeasEditPage />
            </Loading>
          ),
        },
        {
          path: 'ideas',
          element: (
            <Loading admin={false}>
              <IdeasIndexPage />
            </Loading>
          ),
        },
        {
          path: 'ideas/:slug',
          element: (
            <Loading admin={false}>
              <IdeasShowPage />
            </Loading>
          ),
        },
        {
          path: 'initiatives',
          element: (
            <Loading admin={false}>
              <InitiativesIndexPage />
            </Loading>
          ),
        },
        {
          path: 'initiatives/edit/:initiativeId',
          element: (
            <Loading admin={false}>
              <InitiativesEditPage />
            </Loading>
          ),
        },
        {
          path: 'initiatives/new',
          element: (
            <Loading admin={false}>
              <InitiativesNewPage />
            </Loading>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: 'initiatives/:slug',
          element: (
            <Loading admin={false}>
              <InitiativesShowPage />
            </Loading>
          ),
        },
        {
          path: 'projects/:slug/ideas/new',
          element: (
            <Loading admin={false}>
              <IdeasNewPage />
            </Loading>
          ),
        },
        createAdminRoutes(),
        {
          path: 'projects',
          element: (
            <Loading admin={false}>
              <ProjectsIndexPage />
            </Loading>
          ),
        },
        {
          path: 'projects/:slug',
          element: (
            <Loading admin={false}>
              <ProjectsShowPage />
            </Loading>
          ),
          children: [
            {
              index: true,
              element: (
                <Loading admin={false}>
                  <ProjectsShowPage />
                </Loading>
              ),
            },
            {
              path: ':phaseNumber',
              element: (
                <Loading admin={false}>
                  <ProjectsShowPage />
                </Loading>
              ),
            },
            {
              path: '*',
              element: (
                <Loading admin={false}>
                  <ProjectsShowPage />
                </Loading>
              ),
            },
          ],
        },
        {
          path: 'events',
          element: (
            <Loading admin={false}>
              <EventsPage />
            </Loading>
          ),
        },
        {
          path: 'pages/cookie-policy',
          element: (
            <Loading admin={false}>
              <CookiePolicy />
            </Loading>
          ),
        },
        {
          path: 'pages/accessibility-statement',
          element: (
            <Loading admin={false}>
              <AccessibilityStatement />
            </Loading>
          ),
        },
        {
          path: 'pages/:slug',
          element: (
            <Loading admin={false}>
              <PagesShowPage />
            </Loading>
          ),
        },
        {
          path: 'password-recovery',
          element: (
            <Loading admin={false}>
              <PasswordRecovery />
            </Loading>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: 'reset-password',
          element: (
            <Loading admin={false}>
              <PasswordReset />
            </Loading>
          ),
        },
        {
          path: 'subscription-ended',
          element: (
            <Loading admin={false}>
              <SubscriptionEndedPage />
            </Loading>
          ),
        },
        {
          path: 'email-settings',
          element: (
            <Loading admin={false}>
              <EmailSettingsPage />
            </Loading>
          ),
        },
        ...moduleConfiguration.routes.citizen,
        {
          path: '*',
          element: (
            <Loading admin={false}>
              <PagesShowPage />
            </Loading>
          ),
        },
      ],
    },
  ];
}
