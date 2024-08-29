import React from 'react';

import moduleConfiguration from 'modules';
import { Outlet as RouterOutlet } from 'react-router-dom';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

import EsriKeyInput from './Esri/EsriKeyInput';
import messages from './messages';
import PowerBITemplates from './PowerBI/PowerBITemplates';
import PublicAPITokens from './PublicAPI/PublicAPITokens';

import Tools from './';

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
