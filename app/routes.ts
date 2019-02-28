import adminRoutes from 'containers/Admin/routes';

import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default function createRoutes() {
  return [
    {
      path: '/:locale',
      name: 'LocaleWrapper',
      indexRoute: {
        name: 'home',
        component: Loadable({
          loader: () => import('containers/LandingPage'),
          loading: FullPageCenteredSpinner,
        })
      },
      childRoutes: [
        {
          path: 'sign-in',
          name: 'signInPage',
          component: Loadable({
            loader: () => import('containers/SignInPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'sign-up',
          name: 'signUpPage',
          component: Loadable({
            loader: () => import('containers/SignUpPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'invite',
          name: 'signUpPage',
          component: Loadable({
            loader: () => import('containers/SignUpPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'complete-signup',
          name: 'completeSignUpPage',
          component: Loadable({
            loader: () => import('containers/CompleteSignUpPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'authentication-error',
          name: 'completeSignUpPage',
          component: Loadable({
            loader: () => import('containers/CompleteSignUpPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'profile/edit',
          name: 'usersEditPage',
          component: Loadable({
            loader: () => import('containers/UsersEditPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'profile/:slug',
          name: 'usersShowPage',
          component: Loadable({
            loader: () => import('containers/UsersShowPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'ideas/new',
          name: 'IdeasProjectSelectPage',
          component: Loadable({
            loader: () => import('containers/IdeasProjectSelectPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'ideas/edit/:ideaId',
          name: 'IdeasEditPage',
          component: Loadable({
            loader: () => import('containers/IdeasEditPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'ideas',
          name: 'ideasPage',
          component: Loadable({
            loader: () => import('containers/IdeasIndexPage'),
            loading: FullPageCenteredSpinner
          }),
        },
        {
          path: 'ideas/:slug',
          name: 'ideasShow',
          component: Loadable({
            loader: () => import('containers/IdeasShowPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'projects/:slug/ideas/new',
          name: 'IdeasNewPage2',
          component: Loadable({
            loader: () => import('containers/IdeasNewPage2'),
            loading: FullPageCenteredSpinner
          })
        },
        adminRoutes(),
        {
          path: 'projects',
          name: 'Project page',
          component: Loadable({
            loader: () => import('containers/ProjectsIndexPage'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'projects/:slug',
          name: 'Project page',
          component: Loadable({
            loader: () => import('containers/ProjectsShowPage'),
            loading: FullPageCenteredSpinner
          }),
          indexRoute: {
            name: 'Project page',
            component: Loadable({
              loader: () => import('containers/ProjectsShowPage/main'),
              loading: FullPageCenteredSpinner
            })
          },
          childRoutes: [
            {
              path: 'process',
              name: 'Project\'s process page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/process'),
                loading: FullPageCenteredSpinner
              })
            },
            {
              path: 'timeline',
              name: 'Project\'s process page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/process'),
                loading: FullPageCenteredSpinner
              })
            },
            {
              path: 'info',
              name: 'Project\'s info page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/info'),
                loading: FullPageCenteredSpinner
              }),
            },
            {
              path: 'events',
              name: 'Project\'s events page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/events'),
                loading: FullPageCenteredSpinner
              })
            },
            {
              path: 'ideas',
              name: 'Project\'s ideas page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/ideas'),
                loading: FullPageCenteredSpinner
              })
            },
            {
              path: 'survey',
              name: 'Project\'s survey page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/survey'),
                loading: FullPageCenteredSpinner
              })
            },
          ],
        },
        {
          path: 'pages/cookie-policy',
          name: 'cookiePolicy',
          component: Loadable({
            loader: () => import('containers/CookiePolicy'),
            loading: FullPageCenteredSpinner
          })
        },
        {
          path: 'pages/:slug',
          name: 'pagesShowPage',
          component: Loadable({
            loader: () => import('containers/PagesShowPage'),
            loading: FullPageCenteredSpinner
          }),
        },
        {
          path: 'password-recovery',
          name: 'passwordRecovery',
          component: Loadable({
            loader: () => import('containers/PasswordRecovery'),
            loading: FullPageCenteredSpinner
          }),
        },
        {
          path: 'reset-password',
          name: 'passwordReset',
          component: Loadable({
            loader: () => import('containers/PasswordReset'),
            loading: FullPageCenteredSpinner
          }),
        },
        {
          path: '*',
          name: 'notfound',
          component: Loadable({
            loader: () => import('containers/PagesShowPage'),
            loading: FullPageCenteredSpinner
          }),
        },
      ],
    }
  ];
}
