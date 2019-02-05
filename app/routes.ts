import adminRoutes from 'containers/Admin/routes';
// import loadAndRender from 'utils/loadAndRender';
// import LandingPage from 'containers/LandingPage';
// import IdeasShowPage from 'containers/IdeasShowPage';
// import ProjectShowPage from 'containers/ProjectsShowPage';

import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default function createRoutes() {
  return [
    {
      path: '/:locale',
      name: 'LocaleWrapper',
      indexRoute: {
        name: 'home',
        component: Loadable({
          loader: () => import('containers/LandingPage'),
          loading: Spinner
        })
      },
      childRoutes: [
        {
          path: 'sign-in',
          name: 'signInPage',
          component: Loadable({
            loader: () => import('containers/SignInPage'),
            loading: Spinner
          })
        },
        {
          path: 'sign-up',
          name: 'signUpPage',
          component: Loadable({
            loader: () => import('containers/SignUpPage'),
            loading: Spinner
          })
        },
        {
          path: 'invite',
          name: 'signUpPage',
          component: Loadable({
            loader: () => import('containers/SignUpPage'),
            loading: Spinner
          })
        },
        {
          path: 'complete-signup',
          name: 'completeSignUpPage',
          component: Loadable({
            loader: () => import('containers/CompleteSignUpPage'),
            loading: Spinner
          })
        },
        {
          path: 'authentication-error',
          name: 'completeSignUpPage',
          component: Loadable({
            loader: () => import('containers/CompleteSignUpPage'),
            loading: Spinner
          })
        },
        {
          path: 'profile/edit',
          name: 'usersEditPage',
          component: Loadable({
            loader: () => import('containers/UsersEditPage'),
            loading: Spinner
          })
        },
        {
          path: 'profile/:slug',
          name: 'usersShowPage',
          component: Loadable({
            loader: () => import('containers/UsersShowPage'),
            loading: Spinner
          })
        },
        {
          path: 'ideas/new',
          name: 'IdeasProjectSelectPage',
          component: Loadable({
            loader: () => import('containers/IdeasProjectSelectPage'),
            loading: Spinner
          })
        },
        {
          path: 'ideas/edit/:ideaId',
          name: 'IdeasEditPage',
          component: Loadable({
            loader: () => import('containers/IdeasEditPage'),
            loading: Spinner
          })
        },
        {
          path: 'ideas',
          name: 'ideasPage',
          component: Loadable({
            loader: () => import('containers/IdeasIndexPage'),
            loading: Spinner
          }),
        },
        {
          path: 'ideas/:slug',
          name: 'ideasShow',
          component: Loadable({
            loader: () => import('containers/IdeasShowPage'),
            loading: Spinner
          })
        },
        {
          path: 'projects/:slug/ideas/new',
          name: 'IdeasNewPage2',
          component: Loadable({
            loader: () => import('containers/IdeasNewPage2'),
            loading: Spinner
          })
        },
        adminRoutes(),
        {
          path: 'projects',
          name: 'Project page',
          component: Loadable({
            loader: () => import('containers/ProjectsIndexPage'),
            loading: Spinner
          })
        },
        {
          path: 'projects/:slug',
          name: 'Project page',
          component: Loadable({
            loader: () => import('containers/ProjectsShowPage'),
            loading: Spinner
          }),
          indexRoute: {
            name: 'Project page',
            component: Loadable({
              loader: () => import('containers/ProjectsShowPage/main'),
              loading: Spinner
            })
          },
          childRoutes: [
            {
              path: 'process',
              name: 'Project\'s process page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/process'),
                loading: Spinner
              })
            },
            {
              path: 'timeline',
              name: 'Project\'s process page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/process'),
                loading: Spinner
              })
            },
            {
              path: 'info',
              name: 'Project\'s info page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/info'),
                loading: Spinner
              }),
            },
            {
              path: 'events',
              name: 'Project\'s events page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/events'),
                loading: Spinner
              })
            },
            {
              path: 'ideas',
              name: 'Project\'s ideas page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/ideas'),
                loading: Spinner
              })
            },
            {
              path: 'survey',
              name: 'Project\'s survey page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/survey'),
                loading: Spinner
              })
            },
          ],
        },
        {
          path: 'pages/cookie-policy',
          name: 'cookiePolicy',
          component: Loadable({
            loader: () => import('containers/CookiePolicy'),
            loading: Spinner
          })
        },
        {
          path: 'pages/:slug',
          name: 'pagesShowPage',
          component: Loadable({
            loader: () => import('containers/PagesShowPage'),
            loading: Spinner
          }),
        },
        {
          path: 'password-recovery',
          name: 'passwordRecovery',
          component: Loadable({
            loader: () => import('containers/PasswordRecovery'),
            loading: Spinner
          }),
        },
        {
          path: 'reset-password',
          name: 'passwordReset',
          component: Loadable({
            loader: () => import('containers/PasswordReset'),
            loading: Spinner
          }),
        },
        {
          path: '*',
          name: 'notfound',
          component: Loadable({
            loader: () => import('containers/PagesShowPage'),
            loading: Spinner
          }),
        },
      ],
    }
  ];
}
