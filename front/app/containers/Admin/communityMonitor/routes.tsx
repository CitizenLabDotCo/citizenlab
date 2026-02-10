import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

const LiveMonitor = lazy(() => import('./components/LiveMonitor'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings/index'));
const Participants = lazy(() => import('./components/Participants'));

const CommunityMonitorSurveyFormBuilder = lazy(
  () => import('./CommunityMonitorFormBuilder')
);
const AccessRights = lazy(
  () => import('./components/Settings/components/AccessRights')
);
const CommunityMonitorManagement = lazy(
  () => import('./components/Settings/components/CommunityMonitorManagement')
);
const SurveySettings = lazy(
  () => import('./components/Settings/components/SurveySettings')
);
const PopupSettings = lazy(
  () =>
    import(
      './components/Settings/components/SurveySettings/components/PopupSettings'
    )
);

const CommunityMonitor = lazy(() => import('./index'));

export enum communityMonitorRoutes {
  communityMonitor = 'community-monitor',
  communityMonitorSurveyEdit = 'projects/$projectId/phases/$phaseId/survey/edit',
  communityMonitorDefault = '',
  liveMonitor = 'live-monitor',
  participants = 'participants',
  reports = 'reports',
  settings = 'settings',
  settingsSurvey = 'survey',
  settingsPopup = 'popup',
  settingsAccessRights = 'access-rights',
  settingsModerators = 'moderators',
}

export type communityMonitorRouteTypes =
  | AdminRoute<communityMonitorRoutes.communityMonitor>
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.liveMonitor}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.participants}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.reports}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}/${communityMonitorRoutes.settingsSurvey}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}/${communityMonitorRoutes.settingsAccessRights}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}/${communityMonitorRoutes.settingsPopup}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}/${communityMonitorRoutes.settingsModerators}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/projects/${string}/phases/${string}/survey/edit`;

// Community monitor layout route
const communityMonitorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: communityMonitorRoutes.communityMonitor,
  component: () => (
    <PageLoading>
      <CommunityMonitor />
    </PageLoading>
  ),
});

const communityMonitorIndexRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: '/',
  component: () => <Navigate to="live-monitor" replace />,
});

const liveMonitorRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: communityMonitorRoutes.liveMonitor,
  component: () => (
    <PageLoading>
      <LiveMonitor />
    </PageLoading>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: communityMonitorRoutes.reports,
  component: () => (
    <PageLoading>
      <Reports />
    </PageLoading>
  ),
});

// Settings layout route
const settingsRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: communityMonitorRoutes.settings,
  component: () => (
    <PageLoading>
      <Settings />
    </PageLoading>
  ),
});

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  component: () => <Navigate to="survey" replace />,
});

const settingsSurveyRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: communityMonitorRoutes.settingsSurvey,
  component: () => (
    <PageLoading>
      <SurveySettings />
    </PageLoading>
  ),
});

const settingsPopupRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: communityMonitorRoutes.settingsPopup,
  component: () => (
    <PageLoading>
      <PopupSettings />
    </PageLoading>
  ),
});

const settingsAccessRightsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: communityMonitorRoutes.settingsAccessRights,
  component: () => (
    <PageLoading>
      <AccessRights />
    </PageLoading>
  ),
});

const settingsModeratorsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: communityMonitorRoutes.settingsModerators,
  component: () => (
    <PageLoading>
      <CommunityMonitorManagement />
    </PageLoading>
  ),
});

const participantsRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: communityMonitorRoutes.participants,
  component: () => (
    <PageLoading>
      <Participants />
    </PageLoading>
  ),
});

const surveyEditRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: communityMonitorRoutes.communityMonitorSurveyEdit,
  component: () => (
    <PageLoading>
      <CommunityMonitorSurveyFormBuilder />
    </PageLoading>
  ),
});

const createAdminCommunityMonitorRoutes = () => {
  return communityMonitorRoute.addChildren([
    communityMonitorIndexRoute,
    liveMonitorRoute,
    reportsRoute,
    settingsRoute.addChildren([
      settingsIndexRoute,
      settingsSurveyRoute,
      settingsPopupRoute,
      settingsAccessRightsRoute,
      settingsModeratorsRoute,
    ]),
    participantsRoute,
    surveyEditRoute,
  ]);
};

export default createAdminCommunityMonitorRoutes;
