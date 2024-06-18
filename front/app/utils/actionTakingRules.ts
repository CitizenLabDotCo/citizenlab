import { IPhaseData } from 'api/phases/types';
import { IProjectData, ProjectPostingDisabledReason } from 'api/projects/types';
import { IUserData } from 'api/users/types';

import { pastPresentOrFuture } from 'utils/dateUtils';

import { canModerateProject } from './permissions/rules/projectPermissions';

interface ActionPermissionHide {
  show: false;
  enabled: null;
  disabledReason: null;
  authenticationRequirements: null;
}
interface ActionPermissionEnabled {
  show: true;
  enabled: true;
  disabledReason: null;
  authenticationRequirements: null;
}
interface ActionPermissionDisabled<DisabledReasons> {
  show: true;
  enabled: false;
  disabledReason: DisabledReasons;
  authenticationRequirements: null;
}
interface ActionPermissionMaybe {
  show: true;
  enabled: 'maybe';
  disabledReason: null;
  authenticationRequirements: AuthenticationRequirements;
}

export type ActionPermission<DisabledReasons> =
  | ActionPermissionHide
  | ActionPermissionMaybe
  | ActionPermissionEnabled
  | ActionPermissionDisabled<DisabledReasons>;

/* ----------- Idea Posting ------------ */

// When disabled, these are the reasons to explain to the user
export type IIdeaPostingDisabledReason =
  | 'notPermitted'
  | 'postingDisabled'
  | 'postingLimitedMaxReached'
  | 'projectInactive'
  | 'notActivePhase'
  | 'futureEnabled'
  | 'notInGroup';

// When disabled but user might get access, here are the next steps for this user
export type AuthenticationRequirements =
  | 'sign_in_up'
  | 'verify'
  | 'sign_in_up_and_verify'
  | 'complete_registration';

const ideaPostingDisabledReason = (
  backendReason: ProjectPostingDisabledReason | null,
  signedIn: boolean,
  futureEnabled: string | null
): {
  disabledReason: IIdeaPostingDisabledReason | null;
  authenticationRequirements: AuthenticationRequirements | null;
} => {
  switch (backendReason) {
    case 'user_missing_requirements':
      return {
        disabledReason: null,
        authenticationRequirements: 'complete_registration',
      };
    case 'user_not_in_group':
      return {
        disabledReason: 'notInGroup',
        authenticationRequirements: null,
      };
    case 'user_not_verified':
      return signedIn
        ? {
            disabledReason: null,
            authenticationRequirements: 'verify',
          }
        : {
            disabledReason: null,
            authenticationRequirements: 'sign_in_up_and_verify',
          };
    case 'user_not_signed_in':
      return {
        disabledReason: null,
        authenticationRequirements: 'sign_in_up',
      };
    case 'project_inactive':
      return {
        disabledReason: futureEnabled ? 'futureEnabled' : 'projectInactive',
        authenticationRequirements: null,
      };
    case 'posting_disabled':
      return {
        disabledReason: 'postingDisabled',
        authenticationRequirements: null,
      };
    // Only applicable to taking surveys at the moment.
    // Not configurable via admin UI, determined in BE
    case 'posting_limited_max_reached':
      return {
        disabledReason: 'postingLimitedMaxReached',
        authenticationRequirements: null,
      };
    case 'user_not_permitted' || 'user_blocked':
      return {
        disabledReason: 'notPermitted',
        authenticationRequirements: null,
      };
    case 'user_not_active':
      return {
        disabledReason: null,
        authenticationRequirements: 'complete_registration',
      };
    default:
      return {
        disabledReason: 'notPermitted',
        authenticationRequirements: null,
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
  project: IProjectData | null | undefined;
  phase: IPhaseData | undefined;
  authUser: IUserData | undefined;
}): ActionPermission<IIdeaPostingDisabledReason> => {
  const signedIn = !!authUser;

  if (project) {
    const { disabled_reason, future_enabled_at, enabled } =
      project.attributes.action_descriptors.posting_idea;

    if (signedIn && canModerateProject(project.id, { data: authUser })) {
      return {
        show: true,
        enabled: true,
        disabledReason: null,
        authenticationRequirements: null,
      };
    }

    // timeline
    if (phase) {
      // not an enabled ideation or native survey phase
      if (
        !(
          (phase.attributes.participation_method === 'ideation' ||
            phase.attributes.participation_method === 'native_survey') &&
          phase.attributes.posting_enabled &&
          disabled_reason !== 'posting_not_supported'
        )
      ) {
        return {
          show: false,
          enabled: null,
          disabledReason: null,
          authenticationRequirements: null,
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
          disabledReason: 'notActivePhase',
          authenticationRequirements: null,
        };
      }
    }

    if (enabled) {
      return {
        show: true,
        enabled: true,
        disabledReason: null,
        authenticationRequirements: null,
      };
    }

    const { disabledReason, authenticationRequirements } =
      ideaPostingDisabledReason(disabled_reason, signedIn, future_enabled_at);

    if (authenticationRequirements) {
      return {
        authenticationRequirements,
        disabledReason: null,
        show: true,
        enabled: 'maybe',
      };
    }

    return {
      disabledReason,
      authenticationRequirements: null,
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
    authenticationRequirements: null,
  };
};
