import {
  PostingDisabledReason,
  PollDisabledReason,
  IProjectData,
  SurveyDisabledReason,
} from './projects';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { GetProjectChildProps } from 'resources/GetProject';
import { GetPhaseChildProps } from 'resources/GetPhase';
import { isNilOrError } from 'utils/helperUtils';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { IPhaseData } from './phases';

interface ActionPermissionHide {
  show: false;
  enabled: null;
  disabledReason: null;
  action: null;
}
interface ActionPermissionEnabled {
  show: true;
  enabled: true;
  disabledReason: null;
  action: null;
}
interface ActionPermissionDisabled<DisabledReasons> {
  show: true;
  enabled: false;
  disabledReason: DisabledReasons;
  action: null;
}
interface ActionPermissionMaybe {
  show: true;
  enabled: 'maybe';
  disabledReason: null;
  action: IPreliminaryAction;
}

export type ActionPermission<DisabledReasons> =
  | ActionPermissionHide
  | ActionPermissionMaybe
  | ActionPermissionEnabled
  | ActionPermissionDisabled<DisabledReasons>;

/*----------- Idea Posting ------------*/

// When disabled, these are the reasons to explain to the user
export type IIdeaPostingDisabledReason =
  | 'notPermitted'
  | 'postingDisabled'
  | 'projectInactive'
  | 'notActivePhase'
  | 'maybeNotPermitted'
  | 'futureEnabled';

// When disabled but user might get access, here are the next steps for this user
export type IPreliminaryAction =
  | 'sign_in_up'
  | 'verify'
  | 'sign_in_up_and_verify';

const ideaPostingDisabledReason = (
  backendReason: PostingDisabledReason | null,
  signedIn: boolean,
  futureEnabled: string | null
): {
  disabledReason: IIdeaPostingDisabledReason | null;
  action: IPreliminaryAction | null;
} => {
  switch (backendReason) {
    case 'not_verified':
      return signedIn
        ? {
            disabledReason: null,
            action: 'verify',
          }
        : {
            disabledReason: null,
            action: 'sign_in_up_and_verify',
          };
    case 'not_signed_in':
      return {
        disabledReason: null,
        action: 'sign_in_up',
      };
    case 'project_inactive':
      return {
        disabledReason: futureEnabled ? 'futureEnabled' : 'projectInactive',
        action: null,
      };
    case 'posting_disabled':
      return {
        disabledReason: 'postingDisabled',
        action: null,
      };
    case 'not_permitted':
      return {
        disabledReason: signedIn ? 'notPermitted' : 'maybeNotPermitted',
        action: null,
      };
    default:
      return {
        disabledReason: 'notPermitted',
        action: null,
      };
  }
};

/** Should we show and/or disable the idea posting button in the given context. And with what disabledReason?
 * @param context
 *  project: The project context we are posting to.
 *  phase: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  authUser: The currently authenticated user
 */
export const getIdeaPostingRules = ({
  project,
  phase,
  authUser,
}: {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  authUser: GetAuthUserChildProps;
}): ActionPermission<IIdeaPostingDisabledReason> => {
  const signedIn = !isNilOrError(authUser);

  if (!isNilOrError(project)) {
    const {
      disabled_reason,
      future_enabled,
      enabled,
    } = project.attributes.action_descriptor.posting_idea;

    // timeline
    if (!isNilOrError(phase)) {
      // not an enabled ideation phase
      if (
        !(
          phase.attributes.participation_method === 'ideation' &&
          phase.attributes.posting_enabled &&
          disabled_reason !== 'not_ideation'
        )
      ) {
        return {
          show: false,
          enabled: null,
          disabledReason: null,
          action: null,
        };
      }

      // if not in current phase
      if (
        pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]) !== 'present'
      ) {
        return {
          show: true,
          enabled: false,
          disabledReason: 'notActivePhase' as IIdeaPostingDisabledReason,
          action: null,
        };
      }
    }

    // continuous, not an enabled ideation project
    if (
      isNilOrError(phase) &&
      !(
        project.attributes.participation_method === 'ideation' &&
        project.attributes.posting_enabled &&
        disabled_reason !== 'not_ideation'
      )
    ) {
      return {
        show: false,
        enabled: null,
        disabledReason: null,
        action: null,
      };
    }

    if (enabled) {
      return {
        show: true,
        enabled: true,
        disabledReason: null,
        action: null,
      };
    }

    const { disabledReason, action } = ideaPostingDisabledReason(
      disabled_reason,
      signedIn,
      future_enabled
    );

    if (action) {
      return {
        action,
        disabledReason: null,
        show: true,
        enabled: 'maybe',
      };
    }

    return {
      disabledReason,
      action: null,
      show: true,
      enabled: false,
    } as ActionPermissionDisabled<IIdeaPostingDisabledReason>;
    // TODO enforce the validity of this by adding a test to ensure either action or disabledReason is not null
  }
  // if !project
  return {
    show: true,
    enabled: true,
    disabledReason: null,
    action: null,
  };
};

/*----------- Poll Taking ------------*/

export type IPollTakingDisabledReason =
  | 'notPermitted'
  | 'maybeNotPermitted'
  | 'projectInactive'
  | 'notActivePhase'
  | 'alreadyResponded'
  | 'notVerified'
  | 'maybeNotVerified';

const pollTakingDisabledReason = (
  backendReason: PollDisabledReason | null,
  signedIn: boolean
): IPollTakingDisabledReason => {
  switch (backendReason) {
    case 'project_inactive':
      return 'projectInactive';
    case 'already_responded':
      return 'alreadyResponded';
    case 'not_verified':
      return signedIn ? 'notVerified' : 'maybeNotVerified';
    case 'not_permitted':
      return signedIn ? 'notPermitted' : 'maybeNotPermitted';
    case 'not_signed_in':
      return 'maybeNotPermitted';
    default:
      return 'notPermitted';
  }
};

/** Should we enable taking the poll in the curret context? And if not, with what message?
 * @param context
 *  project: The project context we are posting to.
 *  phaseContext: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  signedIn: Whether the user is currently authenticated
 */
export const getPollTakingRules = ({
  project,
  phaseContext,
  signedIn,
}: {
  project: IProjectData;
  phaseContext?: IPhaseData | null;
  signedIn: boolean;
}): ActionPermission<IPollTakingDisabledReason> => {
  const {
    enabled,
    disabled_reason,
  } = project.attributes.action_descriptor.taking_poll;

  if (phaseContext) {
    if (
      phaseContext &&
      pastPresentOrFuture([
        phaseContext.attributes.start_at,
        phaseContext.attributes.end_at,
      ]) !== 'present'
    ) {
      return {
        enabled: false,
        disabledReason: 'notActivePhase',
        show: true,
        action: null,
      };
    }
  }

  if (enabled) {
    return {
      enabled,
      disabledReason: null,
      show: true,
      action: null,
    };
  }
  // if not in phase context
  return {
    enabled: false,
    disabledReason: pollTakingDisabledReason(disabled_reason, !!signedIn),
    show: true,
    action: null,
  };
};

export type ISurveyTakingDisabledReason =
  | 'notPermitted'
  | 'maybeNotPermitted'
  | 'maybeNotVerified'
  | 'projectInactive'
  | 'notActivePhase'
  | 'notVerified';

const surveyTakingDisabledReason = (
  backendReason: SurveyDisabledReason | null,
  signedIn: boolean
): ISurveyTakingDisabledReason => {
  switch (backendReason) {
    case 'project_inactive':
      return 'projectInactive';
    case 'not_signed_in':
      return 'maybeNotPermitted';
    case 'not_verified':
      return signedIn ? 'notVerified' : 'maybeNotVerified';
    case 'not_permitted':
      return signedIn ? 'notPermitted' : 'maybeNotPermitted';
    default:
      return 'notPermitted';
  }
};

/** Should we show the survey in the given context? And if not, with what message?
 * @param context
 *  project: The project context we are posting to.
 *  phaseContext: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  signedIn: Whether the user is currently authenticated
 */
export const getSurveyTakingRules = ({
  project,
  phaseContext,
  signedIn,
}: {
  project: IProjectData;
  phaseContext?: IPhaseData | null;
  signedIn: boolean;
}): ActionPermission<ISurveyTakingDisabledReason> => {
  if (phaseContext) {
    const inCurrentPhase =
      pastPresentOrFuture([
        phaseContext.attributes.start_at,
        phaseContext.attributes.end_at,
      ]) === 'present';
    const {
      disabled_reason,
      enabled,
    } = project.attributes.action_descriptor.taking_survey;

    if (inCurrentPhase) {
      return {
        enabled,
        disabledReason: enabled
          ? null
          : surveyTakingDisabledReason(disabled_reason, !!signedIn),
        action: null,
        show: true,
      } as
        | ActionPermissionDisabled<ISurveyTakingDisabledReason>
        | ActionPermissionEnabled;
    } else {
      // if not in current phase
      return {
        enabled: false,
        disabledReason: 'notActivePhase',
        action: null,
        show: true,
      };
    }
  } else {
    // if not in phase context
    const {
      enabled,
      disabled_reason,
    } = project.attributes.action_descriptor.taking_survey;
    return {
      enabled,
      disabledReason: enabled
        ? null
        : surveyTakingDisabledReason(disabled_reason, !!signedIn),
      action: null,
      show: true,
    } as
      | ActionPermissionDisabled<ISurveyTakingDisabledReason>
      | ActionPermissionEnabled;
  }
};
