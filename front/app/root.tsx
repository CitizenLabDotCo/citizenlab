import React, { useEffect } from 'react';

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import * as Sentry from '@sentry/react';
import { wrapUseRoutes } from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import modules from 'modules';
import { render } from 'react-dom';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
  useRoutes,
  unstable_HistoryRouter as HistoryRouter,
} from 'react-router-dom';

import App from 'containers/App';
import LanguageProvider from 'containers/LanguageProvider';
import OutletsProvider from 'containers/OutletsProvider';

import history from 'utils/browserHistory';
import { queryClient } from 'utils/cl-react-query/queryClient';

import createRoutes from './routes';

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
    <QueryClientProvider client={queryClient}>
      <OutletsProvider>
        <LanguageProvider>
          <HistoryRouter history={history as any}>
            <App>
              <Routes />
            </App>
          </HistoryRouter>
        </LanguageProvider>
      </OutletsProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
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
