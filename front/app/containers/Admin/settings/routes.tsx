import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute } from '../routes';

import createRegistrationRoutes from './registration/routes';

const AdminSettingsIndex = lazy(() => import('containers/Admin/settings'));
const AdminSettingsGeneral = lazy(
  () => import('containers/Admin/settings/general')
);
const AdminSettingsCustomize = lazy(
  () => import('containers/Admin/settings/customize')
);
const AdminSettingsPolicies = lazy(
  () => import('containers/Admin/settings/policies')
);
// areas
const AdminAreasAll = lazy(() => import('./areas/all'));
const AdminAreasNew = lazy(() => import('./areas/New'));
const AdminAreasEdit = lazy(() => import('./areas/Edit'));

// topics
const TopicsMain = React.lazy(() => import('./topics/TopicsMain'));
const AdminTopicsNewComponent = lazy(
  () => import('./topics/global_topics/New')
);
const AdminTopicsEditComponent = lazy(
  () => import('./topics/global_topics/Edit')
);
// default input topics
const AdminDefaultInputTopicsNewComponent = lazy(
  () => import('./topics/default_input_topics/New')
);
const AdminDefaultInputTopicsEditComponent = lazy(
  () => import('./topics/default_input_topics/Edit')
);

// statuses
const StatusesMain = React.lazy(
  () => import('./statuses/containers/statusesMain')
);
const NewStatusComponent = React.lazy(
  () => import('./statuses/containers/new')
);
const StatusShowComponent = React.lazy(
  () => import('./statuses/containers/edit')
);

// Topics new search schema (for parent_id)
const topicsNewSearchSchema = yup.object({
  parent_id: yup.string().optional(),
});

export type TopicsNewSearchParams = yup.InferType<typeof topicsNewSearchSchema>;

export const settingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'settings',
  component: () => (
    <PageLoading>
      <AdminSettingsIndex />
    </PageLoading>
  ),
});

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  component: () => <Navigate to="general" replace />,
});

const generalRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'general',
  component: () => (
    <PageLoading>
      <AdminSettingsGeneral />
    </PageLoading>
  ),
});

const brandingRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'branding',
  component: () => (
    <PageLoading>
      <AdminSettingsCustomize />
    </PageLoading>
  ),
});

const policiesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'policies',
  component: () => (
    <PageLoading>
      <AdminSettingsPolicies />
    </PageLoading>
  ),
});

// statuses
const statusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'statuses',
  component: () => (
    <PageLoading>
      <StatusesMain />
    </PageLoading>
  ),
});

const ideationRoute = createRoute({
  getParentRoute: () => statusesRoute,
  path: 'ideation',
});

const ideationNewRoute = createRoute({
  getParentRoute: () => ideationRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <NewStatusComponent variant="ideation" />
    </PageLoading>
  ),
});

const ideationStatusRoute = createRoute({
  getParentRoute: () => ideationRoute,
  path: '$statusId',
  component: () => (
    <PageLoading>
      <StatusShowComponent variant="ideation" />
    </PageLoading>
  ),
});

const proposalsRoute = createRoute({
  getParentRoute: () => statusesRoute,
  path: 'proposals',
});

const proposalsNewRoute = createRoute({
  getParentRoute: () => proposalsRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <NewStatusComponent variant="proposals" />
    </PageLoading>
  ),
});

const proposalsStatusRoute = createRoute({
  getParentRoute: () => proposalsRoute,
  path: '$statusId',
  component: () => (
    <PageLoading>
      <StatusShowComponent variant="proposals" />
    </PageLoading>
  ),
});

// areas
const areasRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'areas',
});

const areasIndexRoute = createRoute({
  getParentRoute: () => areasRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminAreasAll />
    </PageLoading>
  ),
});

const areasNewRoute = createRoute({
  getParentRoute: () => areasRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <AdminAreasNew />
    </PageLoading>
  ),
});

const areasEditRoute = createRoute({
  getParentRoute: () => areasRoute,
  path: '$areaId',
  component: () => (
    <PageLoading>
      <AdminAreasEdit />
    </PageLoading>
  ),
});

// topics
const topicsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'topics',
  component: () => (
    <PageLoading>
      <TopicsMain />
    </PageLoading>
  ),
});

const topicsIndexRoute = createRoute({
  getParentRoute: () => topicsRoute,
  path: '/',
  component: () => <Navigate to="platform" replace />,
});

const platformRoute = createRoute({
  getParentRoute: () => topicsRoute,
  path: 'platform',
});

const platformNewRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <AdminTopicsNewComponent />
    </PageLoading>
  ),
});

const platformEditRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: '$topicId/edit',
  component: () => (
    <PageLoading>
      <AdminTopicsEditComponent />
    </PageLoading>
  ),
});

const inputRoute = createRoute({
  getParentRoute: () => topicsRoute,
  path: 'input',
});

const inputNewRoute = createRoute({
  getParentRoute: () => inputRoute,
  path: 'new',
  validateSearch: (search: Record<string, unknown>): TopicsNewSearchParams =>
    topicsNewSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <AdminDefaultInputTopicsNewComponent />
    </PageLoading>
  ),
});

const inputEditRoute = createRoute({
  getParentRoute: () => inputRoute,
  path: '$defaultInputTopicId/edit',
  component: () => (
    <PageLoading>
      <AdminDefaultInputTopicsEditComponent />
    </PageLoading>
  ),
});

const createAdminSettingsRoutes = () => {
  return settingsRoute.addChildren([
    settingsIndexRoute,
    generalRoute,
    brandingRoute,
    policiesRoute,
    statusesRoute.addChildren([
      ideationRoute.addChildren([ideationNewRoute, ideationStatusRoute]),
      proposalsRoute.addChildren([proposalsNewRoute, proposalsStatusRoute]),
    ]),
    createRegistrationRoutes(),
    areasRoute.addChildren([areasIndexRoute, areasNewRoute, areasEditRoute]),
    topicsRoute.addChildren([
      topicsIndexRoute,
      platformRoute.addChildren([platformNewRoute, platformEditRoute]),
      inputRoute.addChildren([inputNewRoute, inputEditRoute]),
    ]),
    // TODO: Wire in module routes (admin.settings) after conversion
    // ...moduleConfiguration.routes['admin.settings'],
  ]);
};

export default createAdminSettingsRoutes;
