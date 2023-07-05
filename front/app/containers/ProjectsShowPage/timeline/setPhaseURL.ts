import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { Locale } from 'typings';
import clHistory from 'utils/cl-router/history';

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
