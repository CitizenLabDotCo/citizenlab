import { IProjectData, PostingDisabledReasons } from './projects';
import { IPhaseData } from './phases';
import { pastPresentOrFuture } from 'utils/dateUtils';

export type DisabledReasons = 'notPermitted' | 'maybeNotPermitted' | 'postingDisabled' | 'projectInactive' | 'notActivePhase' | 'futureEnabled';

type ButtonStateResponse  = {
  show: boolean;
  enabled: boolean;
  disabledReason?: DisabledReasons | null;
};

interface PostingButtonStateArg {
  project?: IProjectData | null;
  phaseContext?: IPhaseData | null;
  signedIn: boolean;
}

const disabledReason = (backendReason: PostingDisabledReasons, signedIn: boolean, futureEnabled: string | null) : DisabledReasons | null => {
  switch (backendReason) {
    case 'project_inactive':
      return 'projectInactive';
    case 'posting_disabled':
      return 'postingDisabled';
    case 'not_permitted':
      return signedIn ? 'notPermitted' : 'maybeNotPermitted';
    default:
      return futureEnabled ? 'futureEnabled' : null;
  }
};

/** Should we show and/or disable the idea posting button in the given context. And with what message?
 * @param context
 *  project: The project context we are posting to. Mandatory.
 *  phaseContext: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  signedIn: Whether the user is currently authenticated
 */
export const postingButtonState = ({ project, phaseContext, signedIn }: PostingButtonStateArg): ButtonStateResponse => {
  if (project && phaseContext) {
    const inCurrentPhase = (pastPresentOrFuture([phaseContext.attributes.start_at, phaseContext.attributes.end_at]) === 'present');
    const { disabled_reason, future_enabled } = project.relationships.action_descriptor.data.posting;

    if (inCurrentPhase) {
      return {
        show: phaseContext.attributes.posting_enabled && disabled_reason !== 'not_ideation',
        enabled: project.relationships.action_descriptor.data.posting.enabled,
        disabledReason: disabledReason(disabled_reason, !!signedIn, future_enabled),
      };
    } else { // if not in current phase
      return {
        show: phaseContext.attributes.posting_enabled && disabled_reason !== 'not_ideation',
        enabled: false,
        disabledReason: 'notActivePhase',
      };
    }
  } else if (project && !phaseContext) { // if not in phase context
    const enabled = project.relationships.action_descriptor.data.posting.enabled;
    const { disabled_reason, future_enabled } = project.relationships.action_descriptor.data.posting;
    return {
      enabled,
      show: project.attributes.posting_enabled && disabled_reason !== 'not_ideation',
      disabledReason: enabled ? undefined : disabledReason(disabled_reason, !!signedIn, future_enabled),
    };
  } else { // if !project
    return {
      show: true,
      enabled: true,
    };
  }
};
