import { ParticipationMethod } from 'api/phases/types';

import { type TypedLinkProps } from 'utils/cl-router/Link';

export const getBackLink = (
  projectId: string,
  phaseId: string,
  participationMethod?: ParticipationMethod
): TypedLinkProps => {
  switch (participationMethod) {
    case 'native_survey':
      return {
        to: '/admin/projects/$projectId/phases/$phaseId/insights',
        params: { projectId, phaseId },
      };
    case 'community_monitor_survey':
      return { to: '/admin/community-monitor/settings' };
    default:
      return {
        to: '/admin/projects/$projectId/phases/$phaseId/ideas',
        params: { projectId, phaseId },
      };
  }
};
