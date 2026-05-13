import { IAppConfiguration } from 'api/app_configuration/types';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

import { pastPresentOrFuture } from './dateUtils';

export function isCommunityMonitorProject(
  projectId: string,
  appConfig?: IAppConfiguration
) {
  const communityMonitorProjectId =
    appConfig?.data.attributes.settings.community_monitor?.project_id;
  return projectId === communityMonitorProjectId;
}

const methodsWithInputs: ParticipationMethod[] = [
  'native_survey',
  'ideation',
  'proposals',
];

export function phaseUsesInputs(participationMethod: ParticipationMethod) {
  return methodsWithInputs.includes(participationMethod);
}

export function isPhaseActive(phase: IPhaseData): boolean {
  return (
    pastPresentOrFuture([
      phase.attributes.start_at,
      phase.attributes.end_at,
    ]) === 'present'
  );
}
