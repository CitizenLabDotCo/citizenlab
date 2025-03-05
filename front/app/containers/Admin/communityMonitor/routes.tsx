import React, { lazy } from 'react';

import { Navigate } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

const LiveMonitor = lazy(() => import('./components/LiveMonitor'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings/index'));
const Participants = lazy(() => import('./components/Participants'));

import { AdminRoute } from '../routes';

import CommunityMonitorSurveyFormBuilder from './CommunityMonitorFormBuilder';
import AccessRights from './components/Settings/components/AccessRights';
import CommunityMonitorManagement from './components/Settings/components/CommunityMonitorManagement';
import SurveySettings from './components/Settings/components/SurveySettings';

const CommunityMonitor = lazy(() => import('./index'));

export enum communityMonitorRoutes {
  communityMonitor = 'community-monitor',
  communityMonitorSurveyEdit = 'projects/:projectId/phases/:phaseId/survey/edit',
  communityMonitorDefault = '',
  liveMonitor = 'live-monitor',
  participants = 'participants',
  reports = 'reports',
  settings = 'settings',
  settingsSurvey = 'survey',
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
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.settings}/${communityMonitorRoutes.settingsModerators}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/projects/${string}/phases/${string}/survey/edit`;

const communityMonitorsRoutes = () => {
  return {
    path: communityMonitorRoutes.communityMonitor,
    element: (
      <PageLoading>
        <CommunityMonitor />
      </PageLoading>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="live-monitor" replace />,
      },
      {
        path: communityMonitorRoutes.liveMonitor,
        element: (
          <PageLoading>
            <LiveMonitor />
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.reports,
        element: (
          <PageLoading>
            <Reports />
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.settings,
        element: (
          <PageLoading>
            <Settings />
          </PageLoading>
        ),
        children: [
          {
            path: '',
            element: <Navigate to="survey" replace />,
          },
          {
            path: communityMonitorRoutes.settingsSurvey,
            element: (
              <PageLoading>
                <>
                  <SurveySettings />
                </>
              </PageLoading>
            ),
          },
          {
            path: communityMonitorRoutes.settingsAccessRights,
            element: (
              <PageLoading>
                <AccessRights />
              </PageLoading>
            ),
          },
          {
            path: communityMonitorRoutes.settingsModerators,
            element: (
              <PageLoading>
                <CommunityMonitorManagement />
              </PageLoading>
            ),
          },
        ],
      },
      {
        path: communityMonitorRoutes.participants,
        element: (
          <PageLoading>
            <Participants />
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.communityMonitorSurveyEdit,
        element: (
          <PageLoading>
            <CommunityMonitorSurveyFormBuilder />
          </PageLoading>
        ),
      },
    ],
  };
};

export default communityMonitorsRoutes;
