import { IProjectData } from './projects';
import { IPhaseData } from './phases';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { Multiloc } from 'typings';

type ButtonStateResponse  = {
  show: boolean;
  enabled: boolean;
  disabledMessage?: Multiloc;
};

interface PostingButtonStateArg {
  project?: IProjectData | null;
  phaseContext?: IPhaseData | null;
}

/** Should we show and/or disable the idea posting button in the given context
 * @param context
 *  project: The project context we are posting to. Mandatory.
 *  phaseContext: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 */
export const postingButtonState = ({ project, phaseContext }: PostingButtonStateArg): ButtonStateResponse => {
  if (project && phaseContext) {
    const inCurrentPhase = (pastPresentOrFuture([phaseContext.attributes.start_at, phaseContext.attributes.end_at]) === 'present');

    if (inCurrentPhase) {
      return {
        show: phaseContext.attributes.posting_enabled,
        enabled: project.relationships.action_descriptor.data.posting.enabled,
      };
    } else { // if not in current phase
      return {
        show: phaseContext.attributes.posting_enabled,
        enabled: false,
      };
    }
  } else if (project && !phaseContext) { // if not in phase context
    return {
      show: project.attributes.posting_enabled,
      enabled: project.relationships.action_descriptor.data.posting.enabled,
    };
  } else { // if !project
    return {
      show: true,
      enabled: true,
    };
  }
};
