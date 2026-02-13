import React, { lazy } from 'react';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { parseModuleRoutes, RouteConfiguration } from 'utils/moduleUtils';
import { createRoute, Outlet as RouterOutlet } from 'utils/router';

import { adminRoute } from '../routes';

import messages from './messages';

const EsriKeyInput = lazy(() => import('./Esri/EsriKeyInput'));
const PowerBITemplates = lazy(() => import('./PowerBI/PowerBITemplates'));
const PublicAPITokens = lazy(() => import('./PublicAPI/PublicAPITokens'));
const WebhookSubscriptions = lazy(
  () => import('./Webhooks/WebhookSubscriptions')
);
const Tools = lazy(() => import('./'));

const toolsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'tools',
  component: () => (
    <PageLoading>
      <HelmetIntl title={messages.toolsLabel} />
      <RouterOutlet />
    </PageLoading>
  ),
});

const toolsIndexRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <Tools />
    </PageLoading>
  ),
});

const publicApiTokensRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: 'public-api-tokens',
  component: () => (
    <PageLoading>
      <PublicAPITokens />
    </PageLoading>
  ),
});

const powerBiRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: 'power-bi',
  component: () => (
    <PageLoading>
      <PowerBITemplates />
    </PageLoading>
  ),
});

const esriRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: 'esri-integration',
  component: () => (
    <PageLoading>
      <EsriKeyInput />
    </PageLoading>
  ),
});

const webhooksRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: 'webhooks',
  component: () => (
    <PageLoading>
      <WebhookSubscriptions />
    </PageLoading>
  ),
});

const createAdminToolsRoutes = (moduleRoutes: RouteConfiguration[] = []) => {
  return toolsRoute.addChildren([
    toolsIndexRoute,
    publicApiTokensRoute,
    powerBiRoute,
    esriRoute,
    webhooksRoute,
    ...(parseModuleRoutes(moduleRoutes, toolsRoute) as never[]),
  ]);
};

export default createAdminToolsRoutes;
