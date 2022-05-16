import React, { lazy } from 'react';
// import adminRoutes from 'containers/Admin/routes';
// import moduleConfiguration from 'modules';
import LoadingComponent from 'components/UI/Loading';

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
            <LoadingComponent>
              <LandingPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'sign-in',
          name: 'signInPage',
          element: (
            <LoadingComponent>
              <SignUpInPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'sign-up',
          name: 'signUpPage',
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
          name: 'usersEditPage',
          element: (
            <LoadingComponent>
              <UsersEditPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'profile/:userSlug',
          name: 'usersShowPage',
          element: (
            <LoadingComponent>
              <UsersShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'ideas/edit/:ideaId',
          name: 'IdeasEditPage',
          element: (
            <LoadingComponent>
              <IdeasEditPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'ideas',
          name: 'ideasPage',
          element: (
            <LoadingComponent>
              <IdeasIndexPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'ideas/:slug',
          name: 'ideasShow',
          element: (
            <LoadingComponent>
              <IdeasShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'initiatives',
          name: 'initiativesPage',
          element: (
            <LoadingComponent>
              <InitiativesIndexPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'initiatives/edit/:initiativeId',
          name: 'InitiativesEditPage',
          element: (
            <LoadingComponent>
              <InitiativesEditPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'initiatives/new',
          name: 'initiativesNewPage',
          element: (
            <LoadingComponent>
              <InitiativesNewPage />
            </LoadingComponent>
          ),
        },
        // super important that this comes AFTER initiatives/new, if it comes before, new is interpreted as a slug
        {
          path: 'initiatives/:slug',
          name: 'initiativesShow',
          element: (
            <LoadingComponent>
              <InitiativesShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'projects/:slug/ideas/new',
          name: 'IdeasNewPage',
          element: (
            <LoadingComponent>
              <IdeasNewPage />
            </LoadingComponent>
          ),
        },
        // adminRoutes(),
        {
          path: 'projects',
          name: 'Project page',
          element: (
            <LoadingComponent>
              <ProjectsIndexPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'projects/:slug',
          name: 'Project page',
          element: (
            <LoadingComponent>
              <ProjectsShowPage />
            </LoadingComponent>
          ),
          children: [
            {
              name: 'Project page',
              index: true,
              element: (
                <LoadingComponent>
                  <ProjectsShowPage />
                </LoadingComponent>
              ),
            },
            {
              path: ':phaseNumber',
              name: 'Project page: specific phase',
              element: (
                <LoadingComponent>
                  <ProjectsShowPage />
                </LoadingComponent>
              ),
            },
            {
              path: '*',
              name: 'Project page',
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
          name: 'Events page',
          element: (
            <LoadingComponent>
              <EventsPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'pages/cookie-policy',
          name: 'cookiePolicy',
          element: (
            <LoadingComponent>
              <CookiePolicy />
            </LoadingComponent>
          ),
        },
        {
          path: 'pages/accessibility-statement',
          name: 'accessibilityStatement',
          element: (
            <LoadingComponent>
              <AccessibilityStatement />
            </LoadingComponent>
          ),
        },
        {
          path: 'pages/:slug',
          name: 'pagesShowPage',
          element: (
            <LoadingComponent>
              <PagesShowPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'password-recovery',
          name: 'passwordRecovery',
          element: (
            <LoadingComponent>
              <PasswordRecovery />
            </LoadingComponent>
          ),
        },
        {
          // Used as link in email received for password recovery
          path: 'reset-password',
          name: 'passwordReset',
          element: (
            <LoadingComponent>
              <PasswordReset />
            </LoadingComponent>
          ),
        },
        {
          path: 'subscription-ended',
          name: 'subscriptionEnded',
          element: (
            <LoadingComponent>
              <SubscriptionEndedPage />
            </LoadingComponent>
          ),
        },
        {
          path: 'email-settings',
          name: 'EmailSettingPage',
          element: (
            <LoadingComponent>
              <EmailSettingsPage />
            </LoadingComponent>
          ),
        },
        // ...moduleConfiguration.routes.citizen,
        {
          path: '*',
          name: 'notfound',
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
