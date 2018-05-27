// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc

import adminRoutes from 'containers/Admin/routes';
import loadAndRender from 'utils/loadAndRender';

// Static import of all critical containers
// Those will be included in the main.js file
import LandingPage from 'containers/LandingPage';
import IdeasShowPage from 'containers/IdeasShowPage';
import ProjectShowPage from 'containers/ProjectsShowPage';

export default function createRoutes() {
  return [
    {
      path: '/',
      name: 'home',
      component: LandingPage,
    },
    {
      path: '/sign-in',
      name: 'signInPage',
      getComponent: loadAndRender(import('containers/SignInPage')),
    },
    {
      path: '/sign-up',
      name: 'signUpPage',
      getComponent: loadAndRender(import('containers/SignUpPage')),
    },
    {
      path: '/invite',
      name: 'signUpPage',
      getComponent: loadAndRender(import('containers/SignUpPage')),
    },
    {
      path: '/complete-signup',
      name: 'completeSignUpPage',
      getComponent: loadAndRender(import('containers/CompleteSignUpPage')),
    },
    {
      path: '/authentication-error',
      name: 'completeSignUpPage',
      getComponent: loadAndRender(import('containers/CompleteSignUpPage')),
    },
    {
      path: '/profile/edit',
      name: 'usersEditPage',
      getComponent: loadAndRender(import('containers/UsersEditPage')),
    },
    {
      path: '/profile/:slug',
      name: 'usersShowPage',
      getComponent: loadAndRender(import('containers/UsersShowPage')),
    },
    {
      path: '/ideas/new',
      name: 'IdeasProjectSelectPage',
      getComponent: loadAndRender(import('containers/IdeasProjectSelectPage')),
    },
    {
      path: '/ideas/edit/:ideaId',
      name: 'IdeasEditPage',
      getComponent: loadAndRender(import('containers/IdeasEditPage')),
    },
    {
      path: '/ideas',
      name: 'ideasPage',
      getComponent: loadAndRender(import('containers/IdeasIndexPage')),
    },
    {
      path: '/ideas/:slug',
      name: 'ideasShow',
      component: IdeasShowPage,
    },
    {
      path: '/projects/:slug/ideas/new',
      name: 'IdeasNewPage2',
      getComponent: loadAndRender(import('containers/IdeasNewPage2')),
    },
    adminRoutes(),
    {
      path: '/projects',
      name: 'Project page',
      getComponent: loadAndRender(import('containers/ProjectsIndexPage')),
    },
    {
      path: '/projects/:slug',
      name: 'Project page',
      component: ProjectShowPage,
      indexRoute: {
        name: 'Project page',
        getComponent: loadAndRender(import('containers/ProjectsShowPage/main')),
      },
      childRoutes: [
        {
          path: '/projects/:slug/process',
          name: 'Project\'s process page',
          getComponent: loadAndRender(import('containers/ProjectsShowPage/process')),
        },
        {
          path: '/projects/:slug/timeline',
          name: 'Project\'s process page',
          getComponent: loadAndRender(import('containers/ProjectsShowPage/process')),
        },
        {
          path: '/projects/:slug/info',
          name: 'Project\'s info page',
          getComponent: loadAndRender(import('containers/ProjectsShowPage/info')),
        },
        {
          path: '/projects/:slug/events',
          name: 'Project\'s events page',
          getComponent: loadAndRender(import('containers/ProjectsShowPage/events')),
        },
        {
          path: '/projects/:slug/ideas',
          name: 'Project\'s ideas page',
          getComponent: loadAndRender(import('containers/ProjectsShowPage/ideas')),
        },
        {
          path: '/projects/:slug/survey',
          name: 'Project\'s survey page',
          getComponent: loadAndRender(import('containers/ProjectsShowPage/survey')),
        },
      ],
    },
    {
      path: '/pages/:slug',
      name: 'pagesShowPage',
      getComponent: loadAndRender(import('containers/PagesShowPage')),
    },
    {
      path: '/password-recovery',
      name: 'passwordRecovery',
      getComponent: loadAndRender(import('containers/PasswordRecovery')),
    },
    {
      path: '/reset-password',
      name: 'passwordReset',
      getComponent: loadAndRender(import('containers/PasswordReset')),
    },
    {
      path: '*',
      name: 'notfound',
      getComponent: loadAndRender(import('containers/PagesShowPage')),
    },
  ];
}
