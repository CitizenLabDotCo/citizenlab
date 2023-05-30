import React from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import messages from './messages';
import Outlet from 'components/Outlet';
import { Outlet as RouterOutlet } from 'react-router-dom';
import HelmetIntl from 'components/HelmetIntl';
import Tools from './';

const toolsRoutes = () => {
  return {
    path: 'tools',
    element: (
      <PageLoading>
        <Outlet id="app.containers.admin.tools" />
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
      ...moduleConfiguration.routes['admin.tools'],
    ],
  };
};

export default toolsRoutes;
