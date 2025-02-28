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
  participantsProjects = 'participants/projects/:projectId',
  reports = 'reports',
  settings = 'settings',
  settingsSurvey = 'survey',
  settingsAccessRights = 'access-rights',
  settingsModerators = 'moderators',
}

export type communityMonitorRouteTypes =
  | AdminRoute<communityMonitorRoutes.communityMonitor>
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.liveMonitor}`
  | `${AdminRoute<communityMonitorRoutes.communityMonitor>}/${communityMonitorRoutes.participants}/projects/${string}`
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
            <div
              role="tabpanel"
              aria-labelledby="tab-live-monitor"
              tabIndex={0}
            >
              <LiveMonitor />
            </div>
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.reports,
        element: (
          <PageLoading>
            <div role="tabpanel" aria-labelledby="tab-reports" tabIndex={0}>
              <Reports />
            </div>
          </PageLoading>
        ),
      },
      {
        path: communityMonitorRoutes.settings,
        element: (
          <PageLoading>
            <div role="tabpanel" aria-labelledby="tab-settings" tabIndex={0}>
              <Settings />
            </div>
          </PageLoading>
        ),
        children: [
          {
            path: communityMonitorRoutes.settingsSurvey,
            element: (
              <PageLoading>
                <div
                  role="tabpanel"
                  aria-labelledby="tab-settings-survey"
                  tabIndex={0}
                >
                  <>
                    <SurveySettings />
                  </>
                </div>
              </PageLoading>
            ),
          },
          {
            path: communityMonitorRoutes.settingsAccessRights,
            element: (
              <PageLoading>
                <div
                  role="tabpanel"
                  aria-labelledby="tab-settings-access-rights"
                  tabIndex={0}
                >
                  <AccessRights />
                </div>
              </PageLoading>
            ),
          },
          {
            path: communityMonitorRoutes.settingsModerators,
            element: (
              <PageLoading>
                <div
                  role="tabpanel"
                  aria-labelledby="tab-settings-moderators"
                  tabIndex={0}
                >
                  <CommunityMonitorManagement />
                </div>
              </PageLoading>
            ),
          },
        ],
      },
      {
        path: communityMonitorRoutes.participantsProjects,
        element: (
          <PageLoading>
            <div
              role="tabpanel"
              aria-labelledby="tab-participants"
              tabIndex={0}
            >
              <Participants />
            </div>
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
