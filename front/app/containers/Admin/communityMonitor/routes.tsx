import React, { lazy } from 'react';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute } from '../routes';

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

// Community monitor layout route
const communityMonitorRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'community-monitor',
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
  path: 'live-monitor',
  component: () => (
    <PageLoading>
      <LiveMonitor />
    </PageLoading>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: 'reports',
  component: () => (
    <PageLoading>
      <Reports />
    </PageLoading>
  ),
});

// Settings layout route
const settingsRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: 'settings',
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
  path: 'survey',
  component: () => (
    <PageLoading>
      <SurveySettings />
    </PageLoading>
  ),
});

const settingsPopupRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'popup',
  component: () => (
    <PageLoading>
      <PopupSettings />
    </PageLoading>
  ),
});

const settingsAccessRightsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'access-rights',
  component: () => (
    <PageLoading>
      <AccessRights />
    </PageLoading>
  ),
});

const settingsModeratorsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: 'moderators',
  component: () => (
    <PageLoading>
      <CommunityMonitorManagement />
    </PageLoading>
  ),
});

const participantsRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: 'participants',
  component: () => (
    <PageLoading>
      <Participants />
    </PageLoading>
  ),
});

const surveyEditRoute = createRoute({
  getParentRoute: () => communityMonitorRoute,
  path: 'projects/$projectId/phases/$phaseId/survey/edit',
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
