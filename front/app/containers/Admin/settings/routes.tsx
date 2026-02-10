import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

import createRegistrationRoutes, {
  registrationRouteTypes,
} from './registration/routes';

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

export enum settingsRoutes {
  settings = 'settings',
  settingsDefault = '',
  general = 'general',
  branding = 'branding',
  policies = 'policies',
  areas = 'areas',
  new = 'new',
  areaId = '$areaId',
  topics = 'topics',
  platform = 'platform',
  input = 'input',
  edit = 'edit',
  topicEdit = '$topicId/edit',
  defaultInputTopicEdit = '$defaultInputTopicId/edit',
  ideation = 'ideation',
  proposals = 'proposals',
  statuses = 'statuses',
  statusId = '$statusId',
}

export type settingRouteTypes =
  | AdminRoute<settingsRoutes.settings>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.general}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.branding}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.policies}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.areas}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.areas}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.areas}/${string}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.platform}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.platform}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.platform}/${string}/${settingsRoutes.edit}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.input}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.input}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.input}/${string}/${settingsRoutes.edit}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}/${settingsRoutes.proposals}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}/${settingsRoutes.proposals}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}/${settingsRoutes.proposals}/${string}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}/${settingsRoutes.ideation}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}/${settingsRoutes.ideation}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.statuses}/${settingsRoutes.ideation}/${string}`>
  | registrationRouteTypes;

export const settingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: settingsRoutes.settings,
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
  path: settingsRoutes.general,
  component: () => (
    <PageLoading>
      <AdminSettingsGeneral />
    </PageLoading>
  ),
});

const brandingRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: settingsRoutes.branding,
  component: () => (
    <PageLoading>
      <AdminSettingsCustomize />
    </PageLoading>
  ),
});

const policiesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: settingsRoutes.policies,
  component: () => (
    <PageLoading>
      <AdminSettingsPolicies />
    </PageLoading>
  ),
});

// statuses
const statusesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: settingsRoutes.statuses,
  component: () => (
    <PageLoading>
      <StatusesMain />
    </PageLoading>
  ),
});

const ideationRoute = createRoute({
  getParentRoute: () => statusesRoute,
  path: settingsRoutes.ideation,
});

const ideationNewRoute = createRoute({
  getParentRoute: () => ideationRoute,
  path: settingsRoutes.new,
  component: () => (
    <PageLoading>
      <NewStatusComponent variant="ideation" />
    </PageLoading>
  ),
});

const ideationStatusRoute = createRoute({
  getParentRoute: () => ideationRoute,
  path: settingsRoutes.statusId,
  component: () => (
    <PageLoading>
      <StatusShowComponent variant="ideation" />
    </PageLoading>
  ),
});

const proposalsRoute = createRoute({
  getParentRoute: () => statusesRoute,
  path: settingsRoutes.proposals,
});

const proposalsNewRoute = createRoute({
  getParentRoute: () => proposalsRoute,
  path: settingsRoutes.new,
  component: () => (
    <PageLoading>
      <NewStatusComponent variant="proposals" />
    </PageLoading>
  ),
});

const proposalsStatusRoute = createRoute({
  getParentRoute: () => proposalsRoute,
  path: settingsRoutes.statusId,
  component: () => (
    <PageLoading>
      <StatusShowComponent variant="proposals" />
    </PageLoading>
  ),
});

// areas
const areasRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: settingsRoutes.areas,
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
  path: settingsRoutes.new,
  component: () => (
    <PageLoading>
      <AdminAreasNew />
    </PageLoading>
  ),
});

const areasEditRoute = createRoute({
  getParentRoute: () => areasRoute,
  path: settingsRoutes.areaId,
  component: () => (
    <PageLoading>
      <AdminAreasEdit />
    </PageLoading>
  ),
});

// topics
const topicsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: settingsRoutes.topics,
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
  path: settingsRoutes.platform,
});

const platformNewRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: settingsRoutes.new,
  component: () => (
    <PageLoading>
      <AdminTopicsNewComponent />
    </PageLoading>
  ),
});

const platformEditRoute = createRoute({
  getParentRoute: () => platformRoute,
  path: settingsRoutes.topicEdit,
  component: () => (
    <PageLoading>
      <AdminTopicsEditComponent />
    </PageLoading>
  ),
});

const inputRoute = createRoute({
  getParentRoute: () => topicsRoute,
  path: settingsRoutes.input,
});

const inputNewRoute = createRoute({
  getParentRoute: () => inputRoute,
  path: settingsRoutes.new,
  component: () => (
    <PageLoading>
      <AdminDefaultInputTopicsNewComponent />
    </PageLoading>
  ),
});

const inputEditRoute = createRoute({
  getParentRoute: () => inputRoute,
  path: settingsRoutes.defaultInputTopicEdit,
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
