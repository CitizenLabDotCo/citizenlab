import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';

import { isValidPhase } from 'containers/ProjectsShowPage/phaseParam';

import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

export type CTABarProps = {
  project: IProjectData;
  phases: IPhaseData[] | undefined;
};

// The CTA refers to the current phase, so reselect it before scrolling if
// another phase is selected.
export const useScrollToCurrentPhaseElement = (
  project: IProjectData,
  phases: IPhaseData[] | undefined
) => {
  const { phaseNumber } = useParams({ strict: false }) as {
    phaseNumber?: string;
  };

  return (elementId: string) => {
    const currentPhase = getCurrentPhase(phases);
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
