import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

const SetupTasks = lazy(() => import('.'));

const createAdminSetupTasksRoutes = () =>
  createRoute({
    getParentRoute: () => adminRoute,
    path: 'setup-tasks',
    component: () => (
      <PageLoading>
        <SetupTasks />
      </PageLoading>
    ),
  });

export default createAdminSetupTasksRoutes;
