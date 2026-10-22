import React, { lazy } from 'react';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

const AdminPhase = lazy(() => import('./project/phase'));

export const adminPhaseLink = (projectId: string, phaseId: string) =>
  `/admin/projects/${projectId}/phases/${phaseId}`;

const projectsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'projects',
});

const projectRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '$projectId',
});

const phasesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'phases',
});

const phaseRoute = createRoute({
  getParentRoute: () => phasesRoute,
  path: '$phaseId',
  component: () => <AdminPhase />,
});

const createAdminProjectsRoutes = () =>
  projectsRoute.addChildren([
    projectRoute.addChildren([phasesRoute.addChildren([phaseRoute])]),
  ]);

export default createAdminProjectsRoutes;
