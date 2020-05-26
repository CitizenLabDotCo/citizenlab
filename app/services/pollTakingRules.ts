import { IProjectData, PollDisabledReasons } from './projects';
import { IPhaseData } from './phases';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { get } from 'lodash-es';

export type DisabledReasons =  'notPermitted' | 'maybeNotPermitted' | 'projectInactive' | 'notActivePhase' | 'alreadyResponded' | 'notVerified';

type PollTakeResponse = {
  enabled: boolean;
  disabledReason?: DisabledReasons | null;
};

interface PollTakingStateArgs {
  project: IProjectData;
  phaseContext?: IPhaseData | null;
  signedIn: boolean;
}

const disabledReason = (backendReason: PollDisabledReasons | null, signedIn: boolean): DisabledReasons | null => {
  switch (backendReason) {
    case 'project_inactive':
      return 'projectInactive';
    case 'already_responded':
      return 'alreadyResponded';
    case 'not_verified':
      return signedIn ? 'notVerified' : 'maybeNotPermitted';
    case 'not_permitted':
      return signedIn ? 'notPermitted' : 'maybeNotPermitted';
    default:
      return null;
  }
};

/** Should we enable taking the poll in the curret context? And if not, with what message?
 * @param context
 *  project: The project context we are posting to.
 *  phaseContext: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  signedIn: Whether the user is currently authenticated
 */
export const getPollTakingRules = ({ project, phaseContext, signedIn }: PollTakingStateArgs): PollTakeResponse => {
  if (phaseContext) {
    const inCurrentPhase = (pastPresentOrFuture([phaseContext.attributes.start_at, phaseContext.attributes.end_at]) === 'present');
    const { disabled_reason } = get(project.attributes.action_descriptor, 'taking_poll', { disabled_reason: null });

    if (inCurrentPhase) {
      return {
        enabled: get(project.attributes.action_descriptor, 'taking_poll.enabled'),
        disabledReason: disabledReason(disabled_reason, !!signedIn),
      };
    } else { // if not in current phase
      return {
        enabled: false,
        disabledReason: 'notActivePhase',
      };
    }
  } else { // if not in phase context
    const { enabled, disabled_reason } = get(project.attributes.action_descriptor, 'taking_poll', { disabled_reason: null, enabled: false });
    return {
      enabled,
      disabledReason: enabled ? undefined : disabledReason(disabled_reason, !!signedIn),
    };
  }
};
