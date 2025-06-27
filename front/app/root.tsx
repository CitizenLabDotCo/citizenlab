import React, { StrictMode, useEffect } from 'react';

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import * as Sentry from '@sentry/react';
import { wrapUseRoutesV6 } from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import modules from 'modules';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
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

import prefetchData from './prefetchData';
import createRoutes from './routes';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 0.05,
  sendClientReports: false,
});

const useSentryRoutes = wrapUseRoutesV6(useRoutes);
const routes = createRoutes();

function Routes() {
  useEffect(() => {
    modules.afterMountApplication();
  }, []);

  return useSentryRoutes(routes);
}

const Root = () => {
  useEffect(() => {
    prefetchData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OutletsProvider>
        <HelmetProvider>
          <LanguageProvider>
            <HistoryRouter history={history}>
              <App>
                <Routes />
              </App>
            </HistoryRouter>
          </LanguageProvider>
        </HelmetProvider>
      </OutletsProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const mountApplication = () => {
  const container = document.getElementById('app');
  const root = createRoot(container!);
  try {
    modules.beforeMountApplication();
  } finally {
    // We don't want to use StrictMode during E2E tests, since it causes test failures due to
    // some issues with the re-rendering & re-running of effects in the JSONForms and react-select libraries.
    window.Cypress
      ? root.render(<Root />)
      : root.render(
          <StrictMode>
            <Root />
          </StrictMode>
        );
  }
};

mountApplication();
