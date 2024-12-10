import React, { lazy } from 'react';

import moduleConfiguration from 'modules';
import { Navigate } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

import registrationRoutes, {
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
const AdminTopicsIndexComponent = lazy(() => import('./topics/all'));
const AdminTopicsNewComponent = lazy(() => import('./topics/New'));
const AdminTopicsEditComponent = lazy(() => import('./topics/Edit'));

// statuses
const StatusesComponent = React.lazy(() => import('./statuses/containers/'));
const NewStatusComponent = React.lazy(
  () => import('./statuses/containers/new')
);
const StatusShowComponent = React.lazy(
  () => import('./statuses/containers/edit')
);

// approval
const ProjectReview = lazy(() => import('./projectReview'));

export enum settingsRoutes {
  settings = 'settings',
  settingsDefault = '',
  general = 'general',
  branding = 'branding',
  policies = 'policies',
  areas = 'areas',
  new = 'new',
  areaId = ':areaId',
  topics = 'topics',
  edit = 'edit',
  topicEdit = ':topicId/edit',
  ideation = 'ideation',
  proposals = 'proposals',
  statuses = 'statuses',
  statusId = ':statusId',
  projectReview = 'review',
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
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.topics}/${string}/${settingsRoutes.edit}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.ideation}/${settingsRoutes.statuses}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.ideation}/${settingsRoutes.statuses}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.ideation}/${settingsRoutes.statuses}/${string}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.proposals}/${settingsRoutes.statuses}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.proposals}/${settingsRoutes.statuses}/${settingsRoutes.new}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.proposals}/${settingsRoutes.statuses}/${string}`>
  | AdminRoute<`${settingsRoutes.settings}/${settingsRoutes.projectReview}`>
  | registrationRouteTypes;

export default () => ({
  path: settingsRoutes.settings,
  element: (
    <PageLoading>
      <AdminSettingsIndex />
    </PageLoading>
  ),
  children: [
    {
      path: settingsRoutes.settingsDefault,
      element: <Navigate to="general" replace />,
    },
    {
      path: settingsRoutes.general,
      element: (
        <PageLoading>
          <AdminSettingsGeneral />
        </PageLoading>
      ),
    },
    {
      path: settingsRoutes.branding,
      element: (
        <PageLoading>
          <AdminSettingsCustomize />
        </PageLoading>
      ),
    },
    {
      path: settingsRoutes.policies,
      element: (
        <PageLoading>
          <AdminSettingsPolicies />
        </PageLoading>
      ),
    },
    registrationRoutes(),
    {
      path: settingsRoutes.areas,
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <AdminAreasAll />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.new,
          element: (
            <PageLoading>
              <AdminAreasNew />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.areaId,
          element: (
            <PageLoading>
              <AdminAreasEdit />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: settingsRoutes.topics,
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <AdminTopicsIndexComponent />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.new,
          element: (
            <PageLoading>
              <AdminTopicsNewComponent />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.topicEdit,
          element: (
            <PageLoading>
              <AdminTopicsEditComponent />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: `${settingsRoutes.ideation}/${settingsRoutes.statuses}`,

      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <StatusesComponent variant="ideation" />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.new,
          element: (
            <PageLoading>
              <NewStatusComponent variant="ideation" />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.statusId,
          element: (
            <PageLoading>
              <StatusShowComponent variant="ideation" />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: `${settingsRoutes.proposals}/${settingsRoutes.statuses}`,

      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <StatusesComponent variant="proposals" />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.new,
          element: (
            <PageLoading>
              <NewStatusComponent variant="proposals" />
            </PageLoading>
          ),
        },
        {
          path: settingsRoutes.statusId,
          element: (
            <PageLoading>
              <StatusShowComponent variant="proposals" />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: settingsRoutes.projectReview,
      element: (
        <PageLoading>
          <ProjectReview />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes['admin.settings'],
  ],
});
