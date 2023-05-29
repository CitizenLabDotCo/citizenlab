import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import messages from './messages';
import Outlet from 'components/Outlet';
import { Outlet as RouterOutlet } from 'react-router-dom';
import HelmetIntl from 'components/HelmetIntl';

const Tools = lazy(() => import('.'));

const toolsRoutes = () => {
  return {
    path: 'tools',
    element: (
      <PageLoading>
        <Outlet id="app.containers.admin.tools" />
        <HelmetIntl title={messages.tools} />
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
