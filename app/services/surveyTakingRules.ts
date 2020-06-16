import { IProjectData, SurveyDisabledReasons } from './projects';
import { IPhaseData } from './phases';
import { pastPresentOrFuture } from 'utils/dateUtils';

export type DisabledReasons = 'notPermitted' | 'maybeNotPermitted' | 'projectInactive' | 'notActivePhase' | 'notVerified';

type SurveyTakeResponse = {
  show: boolean;
  disabledReason?: DisabledReasons | null;
};

interface SurveyTakingStateArgs {
  project: IProjectData;
  phaseContext?: IPhaseData | null;
  signedIn: boolean;
}

const disabledReason = (backendReason: SurveyDisabledReasons | null, signedIn: boolean): DisabledReasons | null => {
  switch (backendReason) {
    case 'project_inactive':
      return 'projectInactive';
    case 'not_verified':
      return 'notVerified';
    case 'not_permitted':
      return signedIn ? 'notPermitted' : 'maybeNotPermitted';
    case 'not_signed_in':
      return 'maybeNotPermitted';
    default:
      return null;
  }
};

/** Should we show the survey in the given context? And if not, with what message?
 * @param context
 *  project: The project context we are posting to.
 *  phaseContext: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  signedIn: Whether the user is currently authenticated
 */
export const surveyTakingState = ({ project, phaseContext, signedIn }: SurveyTakingStateArgs): SurveyTakeResponse => {
  if (phaseContext) {
    const inCurrentPhase = (pastPresentOrFuture([phaseContext.attributes.start_at, phaseContext.attributes.end_at]) === 'present');
    const { disabled_reason } = project.attributes.action_descriptor.taking_survey;

    if (inCurrentPhase) {
      return {
        show: project.attributes.action_descriptor.taking_survey.enabled,
        disabledReason: disabledReason(disabled_reason, !!signedIn),
      };
    } else { // if not in current phase
      return {
        show: false,
        disabledReason: 'notActivePhase',
      };
    }
  } else { // if not in phase context
    const { enabled, disabled_reason } = project.attributes.action_descriptor.taking_survey;

    console.log(project.attributes.action_descriptor.taking_survey);

    return {
      show: enabled,
      disabledReason: enabled ? undefined : disabledReason(disabled_reason, !!signedIn),
    };
  }
};
