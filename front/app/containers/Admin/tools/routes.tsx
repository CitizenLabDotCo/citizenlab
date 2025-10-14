import React, { lazy } from 'react';

import moduleConfiguration from 'modules';
import { Outlet as RouterOutlet } from 'utils/router';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

import messages from './messages';
const EsriKeyInput = lazy(() => import('./Esri/EsriKeyInput'));
const PowerBITemplates = lazy(() => import('./PowerBI/PowerBITemplates'));
const PublicAPITokens = lazy(() => import('./PublicAPI/PublicAPITokens'));
const Tools = lazy(() => import('./'));

export enum toolRoutes {
  tools = 'tools',
  toolsDefault = '',
  publicApiTokens = `public-api-tokens`,
  powerBi = `power-bi`,
  esriIntegration = `esri-integration`,
}

export type toolRouteTypes =
  | AdminRoute<toolRoutes.tools>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.publicApiTokens}`>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.esriIntegration}`>
  | AdminRoute<`${toolRoutes.tools}/${toolRoutes.powerBi}`>;

const toolsRoutes = () => {
  return {
    path: toolRoutes.tools,
    element: (
      <PageLoading>
        <HelmetIntl title={messages.toolsLabel} />
        <RouterOutlet />
      </PageLoading>
    ),
    children: [
      {
        path: toolRoutes.toolsDefault,
        element: (
          <PageLoading>
            <Tools />
          </PageLoading>
        ),
      },
      {
        path: toolRoutes.publicApiTokens,
        element: (
          <PageLoading>
            <PublicAPITokens />
          </PageLoading>
        ),
      },
      {
        path: toolRoutes.powerBi,
        element: (
          <PageLoading>
            <PowerBITemplates />
          </PageLoading>
        ),
      },
      {
        path: toolRoutes.esriIntegration,
        element: (
          <PageLoading>
            <EsriKeyInput />
          </PageLoading>
        ),
      },
      ...moduleConfiguration.routes['admin.tools'],
    ],
  };
};

export default toolsRoutes;
