import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';

import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';

import clHistory from 'utils/cl-router/history';
import { getPhasePreview } from 'utils/phasePreview/runtime';
import { useParams } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

export type CTABarProps = {
  project: IProjectData;
  phases: IPhaseData[] | undefined;
};

// Public pages use the current phase; the phone follows the phase being edited.
export const getCTAPhase = (phases: IPhaseData[] | undefined) => {
  const preview = getPhasePreview();
  return preview
    ? phases?.find((phase) => phase.id === preview.phase.id)
    : getCurrentPhase(phases);
};

export const useScrollToCurrentPhaseElement = (
  project: IProjectData,
  phases: IPhaseData[] | undefined
) => {
  const { phaseNumber } = useParams({ strict: false }) as {
    phaseNumber?: string;
  };

  return (elementId: string) => {
    const currentPhase = getCTAPhase(phases);
    const selectedPhase =
      phases && isValidPhase(phaseNumber, phases)
        ? phases[Number(phaseNumber) - 1]
        : currentPhase;

    if (currentPhase && selectedPhase?.id === currentPhase.id) {
      scrollToElement({ id: elementId, shouldFocus: true });
    } else {
      clHistory.push(`/projects/${project.attributes.slug}#${elementId}`);
    }
  };
};
