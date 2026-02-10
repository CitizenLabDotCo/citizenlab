import React, { lazy } from 'react';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { createRoute, Outlet as RouterOutlet } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

import messages from './messages';

const EsriKeyInput = lazy(() => import('./Esri/EsriKeyInput'));
const PowerBITemplates = lazy(() => import('./PowerBI/PowerBITemplates'));
const PublicAPITokens = lazy(() => import('./PublicAPI/PublicAPITokens'));
const WebhookSubscriptions = lazy(
  () => import('./Webhooks/WebhookSubscriptions')
);
const Tools = lazy(() => import('./'));

export enum toolRoutes {
  tools = 'tools',
  toolsDefault = '',
  publicApiTokens = `public-api-tokens`,
  powerBi = `power-bi`,
  esriIntegration = `esri-integration`,
  webhooks = `webhooks`,
}

export type toolRouteTypes =
  | AdminRoute<toolRoutes.tools>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.publicApiTokens}`>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.esriIntegration}`>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.powerBi}`>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.webhooks}`>;

const toolsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: toolRoutes.tools,
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
  path: toolRoutes.publicApiTokens,
  component: () => (
    <PageLoading>
      <PublicAPITokens />
    </PageLoading>
  ),
});

const powerBiRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: toolRoutes.powerBi,
  component: () => (
    <PageLoading>
      <PowerBITemplates />
    </PageLoading>
  ),
});

const esriRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: toolRoutes.esriIntegration,
  component: () => (
    <PageLoading>
      <EsriKeyInput />
    </PageLoading>
  ),
});

const webhooksRoute = createRoute({
  getParentRoute: () => toolsRoute,
  path: toolRoutes.webhooks,
  component: () => (
    <PageLoading>
      <WebhookSubscriptions />
    </PageLoading>
  ),
});

const createAdminToolsRoutes = () => {
  return toolsRoute.addChildren([
    toolsIndexRoute,
    publicApiTokensRoute,
    powerBiRoute,
    esriRoute,
    webhooksRoute,
    // TODO: Wire in module routes (admin.tools) after conversion
    // ...moduleConfiguration.routes['admin.tools'],
  ]);
};

export default createAdminToolsRoutes;
