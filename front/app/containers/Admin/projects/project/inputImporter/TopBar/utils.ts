import { RouteType } from 'routes';

import { ParticipationMethod } from 'api/phases/types';

export const getBackPath = (
  projectId: string,
  phaseId: string,
  participationMethod?: ParticipationMethod
): RouteType => {
  switch (participationMethod) {
    case 'native_survey':
      return `/admin/projects/${projectId}/phases/${phaseId}/native-survey`;
    case 'community_monitor_survey':
      return `/admin/community-monitor/settings`;
    default:
      return `/admin/projects/${projectId}/phases/${phaseId}/ideas`;
  }
};
