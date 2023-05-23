import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { pastPresentOrFuture } from 'utils/dateUtils';

export type CTABarProps = {
  project: IProjectData;
  phases: IPhaseData[] | undefined;
};

export const hasProjectEndedOrIsArchived = (
  project: IProjectData,
  currentPhase: IPhaseData | undefined
) => {
  const { publication_status } = project.attributes;
  const hasProjectEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;

  return hasProjectEnded || publication_status === 'archived';
};
