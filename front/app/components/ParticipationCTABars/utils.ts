import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { pastPresentOrFuture } from 'utils/dateUtils';

export type CTABarProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const hasRrojectEndedOrIsArchived = (
  project: IProjectData,
  currentPhase: IPhaseData | null
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
