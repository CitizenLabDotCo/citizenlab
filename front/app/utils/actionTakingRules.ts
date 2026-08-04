import { IPhaseData } from 'api/phases/types';
import { getPhaseActionDescriptor } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';
import { IUserData } from 'api/users/types';

import { PhasePostingDisabledReason } from 'utils/actionDescriptors/types';

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
interface ActionPermissionMaybe<DisabledReasons> {
  show: true;
  enabled: 'maybe';
  disabledReason: DisabledReasons | null;
  authenticationRequirements: AuthenticationRequirements;
}

export type ActionPermission<DisabledReasons> =
  | ActionPermissionHide
  | ActionPermissionMaybe<DisabledReasons>
  | ActionPermissionEnabled
  | ActionPermissionDisabled<DisabledReasons>;

/* ----------- Idea Posting ------------ */

// When disabled but user might get access, here are the next steps for this user
export type AuthenticationRequirements =
  | 'sign_in_up'
  | 'verify'
  | 'sign_in_up_and_verify'
  | 'complete_registration';

const ideaPostingDisabledReason = (
  backendReason: PhasePostingDisabledReason | null,
  signedIn: boolean
): {
  disabledReason: PhasePostingDisabledReason | null;
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
        disabledReason: backendReason,
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
        disabledReason: backendReason,
        authenticationRequirements: 'sign_in_up',
      };
    case 'posting_disabled':
      return {
        disabledReason: backendReason,
        authenticationRequirements: null,
      };
    // Only applicable to taking surveys at the moment.
    // Not configurable via admin UI, determined in BE
    case 'posting_limited_max_reached':
      return {
        disabledReason: backendReason,
        authenticationRequirements: null,
      };
    case 'user_blocked':
    case 'user_not_permitted':
      return {
        disabledReason: backendReason,
        authenticationRequirements: null,
      };
    case 'user_not_active':
      return {
        disabledReason: null,
        authenticationRequirements: 'complete_registration',
      };
    default:
      return {
        disabledReason: 'user_not_permitted',
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
}): ActionPermission<PhasePostingDisabledReason> => {
  const signedIn = !!authUser;

  if (project) {
    if (authUser && canModerateProject(project, { data: authUser })) {
      return {
        show: true,
        enabled: true,
        disabledReason: null,
        authenticationRequirements: null,
      };
    }

    // TODO: once the POST /ideas endpoint always carries phase_id in the path, a phase is
    // always resolved before reaching here and the no-phase case becomes unreachable.
    if (!phase) {
      return {
        show: true,
        enabled: false,
        disabledReason: 'inactive_phase',
        authenticationRequirements: null,
      };
    }

    const { disabled_reason, enabled } = getPhaseActionDescriptor(
      phase,
      'posting_idea'
    );

    if (
      disabled_reason === 'inactive_phase' ||
      disabled_reason === 'project_inactive'
    ) {
      return {
        show: true,
        enabled: false,
        disabledReason: disabled_reason,
        authenticationRequirements: null,
      };
    }

    // not an enabled ideation or native survey or proposals phase
    if (
      (phase.attributes.participation_method === 'ideation' ||
        phase.attributes.participation_method === 'proposals') &&
      !phase.attributes.submission_enabled &&
      disabled_reason !== 'posting_not_supported'
    ) {
      return {
        show: false,
        enabled: null,
        disabledReason: null,
        authenticationRequirements: null,
      };
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
      ideaPostingDisabledReason(disabled_reason, signedIn);

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
    } as ActionPermissionDisabled<PhasePostingDisabledReason>;
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
