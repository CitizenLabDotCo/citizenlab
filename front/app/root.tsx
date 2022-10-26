import React, { useEffect } from 'react';
import { render } from 'react-dom';

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import createRoutes from './routes';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import OutletsProvider from 'containers/OutletsProvider';
import modules from 'modules';
import history from 'utils/browserHistory';

import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
  useRoutes,
  unstable_HistoryRouter as HistoryRouter,
} from 'react-router-dom';
import { wrapUseRoutes } from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
  ],
  tracesSampleRate: 0.05,
  sendClientReports: false,
});

const useSentryRoutes = wrapUseRoutes(useRoutes);
const routes = createRoutes();

function Routes() {
  useEffect(() => {
    modules.afterMountApplication();
  }, []);

  return useSentryRoutes(routes);
}

const Root = () => {
  return (
    <OutletsProvider>
      <LanguageProvider>
        <HistoryRouter history={history}>
          <App>
            <Routes />
          </App>
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
