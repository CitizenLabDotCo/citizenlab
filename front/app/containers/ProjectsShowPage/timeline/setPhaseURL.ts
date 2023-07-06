import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import clHistory from 'utils/cl-router/history';
import { getCurrentPhase } from 'api/phases/utils';

export default function setPhaseURL(
  selectedPhaseId: string | undefined,
  phases: IPhaseData[],
  project: IProjectData
) {
  const phaseNumber =
    phases.findIndex((phase) => selectedPhaseId === phase.id) + 1;
  const projectSlug = project.attributes.slug;
  const currentPhase = getCurrentPhase(phases);
  const currentPhaseId = currentPhase?.id;

  const projectURL = `/projects/${projectSlug}`;
  const pathname =
    selectedPhaseId === currentPhaseId
      ? projectURL
      : `${projectURL}/${phaseNumber}`;

  const search = window.location.search;

  clHistory.push({
    pathname,
    search,
  });
}
