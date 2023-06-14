import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { Locale } from 'typings';

export default function setPhaseUrl(
  selectedPhaseId: string | undefined,
  currentPhaseId: string | undefined,
  phases: IPhaseData[],
  project: IProjectData,
  locale: Locale
) {
  const phaseNumber =
    phases.findIndex((phase) => selectedPhaseId === phase.id) + 1;
  const projectSlug = project.attributes.slug;

  const projectURL = `/${locale}/projects/${projectSlug}`;
  const url =
    selectedPhaseId === currentPhaseId
      ? projectURL
      : `${projectURL}/${phaseNumber}`;

  window.history.pushState(null, '', url);
}
