import { includes } from 'lodash';

// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc

import adminRoutes from 'containers/Admin/routes';
import loadAndRender from 'utils/loadAndRender';

// Static import of all critical containers
// Those will be included in the main.js file
import LandingPage from 'containers/LandingPage';
import IdeasShowPage from 'containers/IdeasShowPage';
import ProjectShowPage from 'containers/ProjectsShowPage';

import { currentTenantStream } from 'services/tenant';
import { localeStream, updateLocale } from 'services/locale';
import PlatformLocales from 'platformLocales';
import { combineLatest } from 'rxjs/observable/combineLatest';

// Tries to detect the locale passed in the URL to update the internal state
const localeDetector = (nextState, replace, callback) => {
  const urlLocale = nextState.params.locale;

  combineLatest([
    currentTenantStream().observable,
    localeStream().observable,
  ])
  .first()
  .toPromise()
  .then(([{ data: tenant }, locale]) => {
    if (tenant) {
      const localesSet = new Set(tenant.attributes.settings.core.locales);

      if (urlLocale !== locale) {
        // Update the URL in case the locale in the URL doesn't match the one in the service
        const matchRegexp = new RegExp(`^\/(${urlLocale})\/`);
        replace(`${location.pathname.replace(matchRegexp, `/${locale}/`)}${location.search}`);
      } else if (localesSet.has(urlLocale)) {
        // Update locale in the app if it belongs to the TenantLocales
        updateLocale(urlLocale);
      }

      // Try to add a locale if the param is not a supported locale
      if (!includes(Object.keys(PlatformLocales), urlLocale)) {
        replace(`/${locale}${location.pathname}${location.search}`);
      }

      callback();
    }
  });
};

// Force the presence of a locale if it wasn't present
const forceLocale = (_nextState, replace, callback) => {
  localeStream().observable
  .first()
  .toPromise()
  .then((locale) => {
    replace(`/${locale}${location.pathname}${location.search}`);

    callback();
  });
};

export default function createRoutes() {
  return [
    {
      path: '/:locale',
      name: 'LocaleWrapper',
      onEnter: localeDetector,
      indexRoute: {
        name: 'home',
        component: LandingPage,
      },
      childRoutes: [
        {
          path: 'sign-in',
          name: 'signInPage',
          getComponent: loadAndRender(import('containers/SignInPage')),
        },
        {
          path: 'sign-up',
          name: 'signUpPage',
          getComponent: loadAndRender(import('containers/SignUpPage')),
        },
        {
          path: 'invite',
          name: 'signUpPage',
          getComponent: loadAndRender(import('containers/SignUpPage')),
        },
        {
          path: 'complete-signup',
          name: 'completeSignUpPage',
          getComponent: loadAndRender(import('containers/CompleteSignUpPage')),
        },
        {
          path: 'authentication-error',
          name: 'completeSignUpPage',
          getComponent: loadAndRender(import('containers/CompleteSignUpPage')),
        },
        {
          path: 'profile/edit',
          name: 'usersEditPage',
          getComponent: loadAndRender(import('containers/UsersEditPage')),
        },
        {
          path: 'profile/:slug',
          name: 'usersShowPage',
          getComponent: loadAndRender(import('containers/UsersShowPage')),
        },
        {
          path: 'ideas/new',
          name: 'IdeasProjectSelectPage',
          getComponent: loadAndRender(import('containers/IdeasProjectSelectPage')),
        },
        {
          path: 'ideas/edit/:ideaId',
          name: 'IdeasEditPage',
          getComponent: loadAndRender(import('containers/IdeasEditPage')),
        },
        {
          path: 'ideas',
          name: 'ideasPage',
          getComponent: loadAndRender(import('containers/IdeasIndexPage')),
        },
        {
          path: 'ideas/:slug',
          name: 'ideasShow',
          component: IdeasShowPage,
        },
        {
          path: 'projects/:slug/ideas/new',
          name: 'IdeasNewPage2',
          getComponent: loadAndRender(import('containers/IdeasNewPage2')),
        },
        adminRoutes(),
        {
          path: 'projects',
          name: 'Project page',
          getComponent: loadAndRender(import('containers/ProjectsIndexPage')),
        },
        {
          path: 'projects/:slug',
          name: 'Project page',
          component: ProjectShowPage,
          indexRoute: {
            name: 'Project page',
            getComponent: loadAndRender(import('containers/ProjectsShowPage/main')),
          },
          childRoutes: [
            {
              path: 'process',
              name: 'Project\'s process page',
              getComponent: loadAndRender(import('containers/ProjectsShowPage/process')),
            },
            {
              path: 'timeline',
              name: 'Project\'s process page',
              getComponent: loadAndRender(import('containers/ProjectsShowPage/process')),
            },
            {
              path: 'info',
              name: 'Project\'s info page',
              getComponent: loadAndRender(import('containers/ProjectsShowPage/info')),
            },
            {
              path: 'events',
              name: 'Project\'s events page',
              getComponent: loadAndRender(import('containers/ProjectsShowPage/events')),
            },
            {
              path: 'ideas',
              name: 'Project\'s ideas page',
              getComponent: loadAndRender(import('containers/ProjectsShowPage/ideas')),
            },
            {
              path: 'survey',
              name: 'Project\'s survey page',
              getComponent: loadAndRender(import('containers/ProjectsShowPage/survey')),
            },
          ],
        },
        {
          path: 'pages/:slug',
          name: 'pagesShowPage',
          getComponent: loadAndRender(import('containers/PagesShowPage')),
        },
        {
          path: 'password-recovery',
          name: 'passwordRecovery',
          getComponent: loadAndRender(import('containers/PasswordRecovery')),
        },
        {
          path: 'reset-password',
          name: 'passwordReset',
          getComponent: loadAndRender(import('containers/PasswordReset')),
        },
        {
          path: '*',
          name: 'notfound',
          getComponent: loadAndRender(import('containers/PagesShowPage')),
        },
      ],
    },
    {
      path: '*',
      name: 'NoLocalePath',
      onEnter: forceLocale,
    }
  ];
}
