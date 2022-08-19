import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useEffect } from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line:no-vanilla-routing

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import createRoutes from './routes';
import { init } from '@sentry/react';
// import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import OutletsProvider from 'containers/OutletsProvider';
import modules from 'modules';
import history from 'utils/browserHistory';

import SentryReactRouterV6RouterInstrumentation, {
  reactRouterV6Instrumentation,
} from './SentryReactRouterV6RouterInstrumentation';

import {
  unstable_HistoryRouter as HistoryRouter,
  useRoutes,
  // Routes,
  // useLocation,
  // useNavigationType,
  // createRoutesFromChildren,
  // matchRoutes,
} from 'react-router-dom';

// const SentryRoutes = DomRoutes;

const importedRoutes = createRoutes();

const Routes = () => {
  const routes = useRoutes(importedRoutes);
  useEffect(() => {
    modules.afterMountApplication();
  }, []);

  return (
    <App>
      {routes}
      <SentryReactRouterV6RouterInstrumentation />
    </App>
  );
};

const Root = () => {
  return (
    <OutletsProvider>
      <LanguageProvider>
        <HistoryRouter history={history}>
          <Routes />
        </HistoryRouter>
      </LanguageProvider>
    </OutletsProvider>
  );
};

const mountApplication = () => {
  try {
    modules.beforeMountApplication();
  } finally {
    render(<Root />, document.getElementById('app'));
  }
};

mountApplication();

if (process.env.SENTRY_DSN) {
  // import('@sentry/integrations').then((Integrations) => {
  init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV,
    release: process.env.CIRCLE_BUILD_NUM,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: reactRouterV6Instrumentation(
          importedRoutes,
          true
        ),
      }),
    ],
    tracesSampleRate: 1.0,
  });
  // });
}
