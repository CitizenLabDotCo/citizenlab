import { RouteType } from 'routes';

import { ParticipationMethod } from 'api/phases/types';

export const getBackPath = (
  projectId: string,
  phaseId: string,
  participationMethod?: ParticipationMethod,
  phaseInsightsEnabled = true
): RouteType => {
  switch (participationMethod) {
    case 'native_survey':
      // When phase_insights is disabled, redirect to old 'results' tab
      return phaseInsightsEnabled
        ? `/admin/projects/${projectId}/phases/${phaseId}/insights`
        : `/admin/projects/${projectId}/phases/${phaseId}/results`;
    case 'community_monitor_survey':
      return `/admin/community-monitor/settings`;
    default:
      return `/admin/projects/${projectId}/phases/${phaseId}/ideas`;
  }
};
