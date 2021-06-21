import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { isNilOrError } from 'utils/helperUtils';

export default function setPhaseUrl(
  phase: IPhaseData | null,
  phases: Error | IPhaseData[] | null | undefined,
  project: IProjectData | null | undefined
) {
  console.log(phase);
  console.log(phases);
  console.log(project);
  if (phase === null || isNilOrError(phases) || !project) return;

  const phaseNumber = phases.findIndex((p) => p.id === phase.id);
  const projectSlug = project.attributes.slug;

  const url = `/projects/${projectSlug}/${phaseNumber}`;
  console.log(window.location.href);
}
