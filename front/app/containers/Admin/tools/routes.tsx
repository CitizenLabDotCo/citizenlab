import React from 'react';

import moduleConfiguration from 'modules';
import { Outlet as RouterOutlet } from 'react-router-dom';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import EsriKeyInput from './Esri/EsriKeyInput';
import messages from './messages';
import PowerBITemplates from './PowerBI/PowerBITemplates';
import PublicAPITokens from './PublicAPI/PublicAPITokens';

import Tools from './';

const toolsRoutes = () => {
  return {
    path: 'tools',
    element: (
      <PageLoading>
        <HelmetIntl title={messages.toolsLabel} />
        <RouterOutlet />
      </PageLoading>
    ),
    children: [
      {
        path: '',
        element: (
          <PageLoading>
            <Tools />
          </PageLoading>
        ),
      },
      {
        path: 'public-api-tokens',
        element: (
          <PageLoading>
            <PublicAPITokens />
          </PageLoading>
        ),
      },
      {
        path: 'power-bi',
        element: (
          <PageLoading>
            <PowerBITemplates />
          </PageLoading>
        ),
      },
      {
        path: 'esri-integration',
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
