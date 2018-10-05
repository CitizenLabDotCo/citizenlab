import { isNil, isError } from 'lodash-es';
import { IProjectData } from './projects';
import { IPhaseData } from './phases';
import { pastPresentOrFuture } from 'utils/dateUtils';

interface IPostingButtonStateInput {
  project?: IProjectData | null | Error;
  phase?: IPhaseData | null | Error;
}

export const postingButtonState = ({ project, phase }: IPostingButtonStateInput) => {
  if (!isNil(phase) && !isError(phase)) {
    const inCurrentPhase = (pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]) === 'present');

    if (inCurrentPhase) {
      return {
        show: phase.attributes.posting_enabled,
        enabled: true,
      };
    } else { // if not in current phase
      return {
        show: phase.attributes.posting_enabled,
        enabled: false,
      };
    }
  } else if (!isNil(project) && !isError(project)) { // if in known project context but unknown phase context
    return {
      show: project.attributes.posting_enabled,
      enabled: true,
    };
  } else { // If in totally unknown context
    return {
      show: true,
      enabled: true,
    };
  }
};
