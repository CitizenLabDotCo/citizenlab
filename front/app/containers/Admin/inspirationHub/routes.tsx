import React, { lazy } from 'react';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { createRoute, Outlet as RouterOutlet } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';
import sidebarMessages from '../sideBar/messages';

import messages from './messages';

const InspirationHub = lazy(() => import('.'));

export enum inspirationHubRoutes {
  inspirationHub = 'inspiration-hub',
  inspirationHubDefault = '',
}

export type inspirationHubRouteTypes =
  AdminRoute<inspirationHubRoutes.inspirationHub>;

const inspirationHubRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: inspirationHubRoutes.inspirationHub,
  component: () => (
    <PageLoading>
      <HelmetIntl
        title={sidebarMessages.inspirationHub}
        description={messages.inspirationHubDescription}
      />
      <RouterOutlet />
    </PageLoading>
  ),
});

const inspirationHubIndexRoute = createRoute({
  getParentRoute: () => inspirationHubRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <InspirationHub />
    </PageLoading>
  ),
});

const createAdminInspirationHubRoutes = () => {
  return inspirationHubRoute.addChildren([inspirationHubIndexRoute]);
};

export default createAdminInspirationHubRoutes;
