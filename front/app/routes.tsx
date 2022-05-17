import React, { lazy, Suspense } from 'react';

// import adminRoutes from 'containers/Admin/routes';
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

const LoadingComponent = ({ children }) => {
  return <Suspense fallback={<div>LOADING!</div>}>{children}</Suspense>;
};

export default function createRoutes() {
  return [
    {
      path: '/:locale',
      children: [
        {
          index: true,
          element: (
            <LoadingComponent>
              <LandingPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'sign-in',
          element: (
            <LoadingComponent>
              <SignUpInPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'sign-up',
          element: (
            <LoadingComponent>
              <SignUpInPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'invite',
          element: (
            <LoadingComponent>
              <LandingPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'complete-signup',
          element: (
            <LoadingComponent>
              <LandingPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'authentication-error',
          element: (
            <LoadingComponent>
              <LandingPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'site-map',
          element: (
            <LoadingComponent>
              <SiteMap />
            </LoadingComponent>
          ),
        },
        {
          path: 'profileedit',
          element: (
            <LoadingComponent>
              <UsersEditPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'profile/:userSlug',
          element: (
            <LoadingComponent>
              <UsersShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'ideas/edit/:ideaId',
          element: (
            <LoadingComponent>
              <IdeasEditPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'ideas',
          element: (
            <LoadingComponent>
              <IdeasIndexPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'ideas/:slug',
          element: (
            <LoadingComponent>
              <IdeasShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'initiatives',
          element: (
            <LoadingComponent>
              <InitiativesIndexPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'initiatives/edit/:initiativeId',
          element: (
            <LoadingComponent>
              <InitiativesEditPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'initiatives/new',
          element: (
            <LoadingComponent>
              <InitiativesNewPage />
            </LoadingComponent>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: 'initiatives/:slug',
          element: (
            <LoadingComponent>
              <InitiativesShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'projects/:slug/ideas/new',
          element: (
            <LoadingComponent>
              <IdeasNewPage />
            </LoadingComponent>
          ),
        },
        // adminRoutes(),
        {
          path: 'projects',
          element: (
            <LoadingComponent>
              <ProjectsIndexPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'projects/:slug',
          element: (
            <LoadingComponent>
              <ProjectsShowPage />
            </LoadingComponent>
          ),
          children: [
            {
              index: true,
              element: (
                <LoadingComponent>
                  <ProjectsShowPage />
                </LoadingComponent>
              ),
            },
            {
              path: ':phaseNumber',
              element: (
                <LoadingComponent>
                  <ProjectsShowPage />
                </LoadingComponent>
              ),
            },
            {
              path: '*',
              element: (
                <LoadingComponent>
                  <ProjectsShowPage />
                </LoadingComponent>
              ),
            },
          ],
        },
        {
          path: 'events',
          element: (
            <LoadingComponent>
              <EventsPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'pages/cookie-policy',
          element: (
            <LoadingComponent>
              <CookiePolicy />
            </LoadingComponent>
          ),
        },
        {
          path: 'pages/accessibility-statement',
          element: (
            <LoadingComponent>
              <AccessibilityStatement />
            </LoadingComponent>
          ),
        },
        {
          path: 'pages/:slug',
          element: (
            <LoadingComponent>
              <PagesShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'password-recovery',
          element: (
            <LoadingComponent>
              <PasswordRecovery />
            </LoadingComponent>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: 'reset-password',
          element: (
            <LoadingComponent>
              <PasswordReset />
            </LoadingComponent>
          ),
        },
        {
          path: 'subscription-ended',
          element: (
            <LoadingComponent>
              <SubscriptionEndedPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'email-settings',
          element: (
            <LoadingComponent>
              <EmailSettingsPage />
            </LoadingComponent>
          ),
        },
        ...moduleConfiguration.routes.citizen,
        {
          path: '*',
          element: (
            <LoadingComponent>
              <PagesShowPage />
            </LoadingComponent>
          ),
        },
      ],
    },
  ];
}
