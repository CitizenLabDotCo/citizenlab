import adminRoutes from 'containers/Admin/routes';

import Loadable from 'react-loadable';
import LoadableLoading from 'components/UI/LoadableLoading';

export default function createRoutes() {
  return [
    {
      path: '/:locale',
      name: 'LocaleWrapper',
      indexRoute: {
        name: 'home',
        component: Loadable({
          loader: () => import('containers/LandingPage'),
          loading: LoadableLoading,
          delay: 500
        })
      },
      childRoutes: [
        {
          path: 'sign-in',
          name: 'signInPage',
          component: Loadable({
            loader: () => import('containers/SignInPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'sign-up',
          name: 'signUpPage',
          component: Loadable({
            loader: () => import('containers/SignUpPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'invite',
          name: 'signUpPage',
          component: Loadable({
            loader: () => import('containers/SignUpPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'complete-signup',
          name: 'completeSignUpPage',
          component: Loadable({
            loader: () => import('containers/CompleteSignUpPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'authentication-error',
          name: 'completeSignUpPage',
          component: Loadable({
            loader: () => import('containers/CompleteSignUpPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'profile/edit',
          name: 'usersEditPage',
          component: Loadable({
            loader: () => import('containers/UsersEditPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'profile/:slug',
          name: 'usersShowPage',
          component: Loadable({
            loader: () => import('containers/UsersShowPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'ideas/new',
          name: 'IdeasProjectSelectPage',
          component: Loadable({
            loader: () => import('containers/IdeasProjectSelectPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'ideas/edit/:ideaId',
          name: 'IdeasEditPage',
          component: Loadable({
            loader: () => import('containers/IdeasEditPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'ideas',
          name: 'ideasPage',
          component: Loadable({
            loader: () => import('containers/IdeasIndexPage'),
            loading: LoadableLoading,
            delay: 500
          }),
        },
        {
          path: 'ideas/:slug',
          name: 'ideasShow',
          component: Loadable({
            loader: () => import('containers/IdeasShowPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'projects/:slug/ideas/new',
          name: 'IdeasNewPage2',
          component: Loadable({
            loader: () => import('containers/IdeasNewPage2'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        adminRoutes(),
        {
          path: 'projects',
          name: 'Project page',
          component: Loadable({
            loader: () => import('containers/ProjectsIndexPage'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'projects/:slug',
          name: 'Project page',
          component: Loadable({
            loader: () => import('containers/ProjectsShowPage'),
            loading: LoadableLoading,
            delay: 500
          }),
          indexRoute: {
            name: 'Project page',
            component: Loadable({
              loader: () => import('containers/ProjectsShowPage/main'),
              loading: LoadableLoading,
              delay: 500
            })
          },
          childRoutes: [
            {
              path: 'process',
              name: 'Project\'s process page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/process'),
                loading: LoadableLoading,
                delay: 500
              })
            },
            {
              path: 'timeline',
              name: 'Project\'s process page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/process'),
                loading: LoadableLoading,
                delay: 500
              })
            },
            {
              path: 'info',
              name: 'Project\'s info page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/info'),
                loading: LoadableLoading,
                delay: 500
              }),
            },
            {
              path: 'events',
              name: 'Project\'s events page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/events'),
                loading: LoadableLoading,
                delay: 500
              })
            },
            {
              path: 'ideas',
              name: 'Project\'s ideas page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/ideas'),
                loading: LoadableLoading,
                delay: 500
              })
            },
            {
              path: 'survey',
              name: 'Project\'s survey page',
              component: Loadable({
                loader: () => import('containers/ProjectsShowPage/survey'),
                loading: LoadableLoading,
                delay: 500
              })
            },
          ],
        },
        {
          path: 'pages/cookie-policy',
          name: 'cookiePolicy',
          component: Loadable({
            loader: () => import('containers/CookiePolicy'),
            loading: LoadableLoading,
            delay: 500
          })
        },
        {
          path: 'pages/:slug',
          name: 'pagesShowPage',
          component: Loadable({
            loader: () => import('containers/PagesShowPage'),
            loading: LoadableLoading,
            delay: 500
          }),
        },
        {
          path: 'password-recovery',
          name: 'passwordRecovery',
          component: Loadable({
            loader: () => import('containers/PasswordRecovery'),
            loading: LoadableLoading,
            delay: 500
          }),
        },
        {
          path: 'reset-password',
          name: 'passwordReset',
          component: Loadable({
            loader: () => import('containers/PasswordReset'),
            loading: LoadableLoading,
            delay: 500
          }),
        },
        {
          path: '*',
          name: 'notfound',
          component: Loadable({
            loader: () => import('containers/PagesShowPage'),
            loading: LoadableLoading,
            delay: 500
          }),
        },
      ],
    }
  ];
}
