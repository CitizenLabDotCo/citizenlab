import React, { StrictMode, useEffect } from 'react';

import 'assets/css/reset.min.css';
import 'assets/fonts/fonts.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import * as Sentry from '@sentry/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import modules from 'modules';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import LanguageProvider from 'containers/LanguageProvider';
import OutletsProvider from 'containers/OutletsProvider';
import 'utils/locale';

import { queryClient } from 'utils/cl-react-query/queryClient';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Route,
  RouterProvider,
} from 'utils/router';

import prefetchData from './prefetchData';
import createRoutes from './routes2';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV,
  integrations: [
    Sentry.browserTracingIntegration(),
    // Sentry.reactRouterV6BrowserTracingIntegration({
    //   useEffect: React.useEffect,
    //   useLocation,
    //   useNavigationType,
    //   createRoutesFromChildren,
    //   matchRoutes,
    // }),
  ],
  tracesSampleRate: 0.05,
  sendClientReports: false,
});

// const useSentryRoutes = wrapUseRoutesV6(useRoutes);
const legacyRoutes = createRoutes();

type LegacyRoutes = typeof legacyRoutes;

const findComponent = (legacyRoute: any) => {
  if (legacyRoute.component) {
    return legacyRoute.component;
  }

  if (legacyRoute.children) {
    const indexComponent = legacyRoute.children.find(
      (child: any) => child.index
    );
    if (indexComponent) {
      return indexComponent.component;
    }
  }

  return undefined;
};

const setupRouter = (legacyRoutes: LegacyRoutes) => {
  const rootRoute = createRootRoute({});

  const children: Route[] = [];

  legacyRoutes.forEach((legacyRoute: any) => {
    const route = createRoute({
      getParentRoute: () => rootRoute,
      path: legacyRoute.path,
      component: findComponent(legacyRoute),
    });

    children.push(route as any);
  });

  const routeTree = rootRoute.addChildren(children);

  return createRouter({ routeTree });
};

const router = setupRouter(legacyRoutes);

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
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
            <div>
              <RouterProvider router={router} />
            </div>
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
