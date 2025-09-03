import { IAppConfiguration } from 'api/app_configuration/types';
import { IPhaseData } from 'api/phases/types';

import { pastPresentOrFuture } from './dateUtils';

export function isCommunityMonitorProject(
  projectId: string,
  appConfig?: IAppConfiguration
) {
  const communityMonitorProjectId =
    appConfig?.data.attributes.settings.community_monitor?.project_id;
  return projectId === communityMonitorProjectId;
}

export function isPhaseActive(phase: IPhaseData): boolean {
  return (
    pastPresentOrFuture([
      phase.attributes.start_at,
      phase.attributes.end_at,
    ]) === 'present'
  );
}
