import 'core-js/stable';
import 'regenerator-runtime/runtime';
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
  unstable_HistoryRouter as HistoryRouter,
  useRoutes,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

const useSentryRoutes = Sentry.wrapUseRoutes(useRoutes);

const Routes = () => {
  const importedRoutes = createRoutes();
  const routes = useSentryRoutes(importedRoutes);
  useEffect(() => {
    modules.afterMountApplication();
  }, []);

  return <App>{routes}</App>;
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
  import('@sentry/integrations').then((Integrations) => {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENV,
      release: process.env.CIRCLE_BUILD_NUM,
      integrations: [
        new Integrations.RewriteFrames(),
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
        }),
      ],
      tracesSampleRate: 0.05,
    });
  });
}
