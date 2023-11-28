import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import clHistory from 'utils/cl-router/history';
import { getCurrentPhase } from 'api/phases/utils';
import { getTimelineTab } from 'containers/Admin/projects/project/timeline/utils';

export default function setPhaseURL(
  selectedPhase: IPhaseData,
  phases: IPhaseData[],
  project: IProjectData,
  isBackoffice?: boolean
) {
  const selectedPhaseId = selectedPhase.id;
  const phaseNumber =
    phases.findIndex((phase) => selectedPhaseId === phase.id) + 1;
  const projectSlug = project.attributes.slug;
  const currentPhase = getCurrentPhase(phases);
  const currentPhaseId = currentPhase?.id;
  const search = window.location.search;
  const redirectTab = getTimelineTab(selectedPhase);

  if (isBackoffice) {
    const backOfficeProjectURL = `/admin/projects/${project.id}`;
    clHistory.push({
      pathname: `${backOfficeProjectURL}/phases/${selectedPhaseId}/${redirectTab}`,
      search,
    });
  } else {
    const projectURL = `/projects/${projectSlug}`;
    const pathname =
      selectedPhaseId === currentPhaseId
        ? projectURL
        : `${projectURL}/${phaseNumber}`;

    clHistory.push({
      pathname,
      search,
    });
  }
}
