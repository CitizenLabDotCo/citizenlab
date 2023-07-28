import React from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import messages from './messages';
import { Outlet as RouterOutlet } from 'react-router-dom';
import HelmetIntl from 'components/HelmetIntl';
import Tools from './';
import PublicAPITokens from './PublicAPI/PublicAPITokens';

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
      ...moduleConfiguration.routes['admin.tools'],
    ],
  };
};

export default toolsRoutes;
