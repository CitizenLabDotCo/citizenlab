import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { Locale } from 'typings';

export default function setPhaseUrl(
  selectedPhaseId: string,
  phases: IPhaseData[],
  project: IProjectData,
  locale: Locale
) {
  const phaseNumber =
    phases.findIndex((phase) => selectedPhaseId === phase.id) + 1;
  const projectSlug = project.attributes.slug;

  const url = `/${locale}/projects/${projectSlug}/${phaseNumber}`;
  window.history.pushState(null, '', url);
}
