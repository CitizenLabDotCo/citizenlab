import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

export default function setPhaseUrl(
  phase: IPhaseData | null,
  phases: Error | IPhaseData[] | null | undefined,
  project: IProjectData | null | undefined,
  locale: Error | Locale | null | undefined
) {
  if (
    phase === null ||
    isNilOrError(phases) ||
    !project ||
    isNilOrError(locale)
  ) {
    return;
  }

  const phaseNumber = phases.findIndex((p) => p.id === phase.id) + 1;
  const projectSlug = project.attributes.slug;

  const url = `/${locale}/projects/${projectSlug}/${phaseNumber}`;
  window.history.pushState(null, '', url);
}
