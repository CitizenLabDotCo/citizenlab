import { pastPresentOrFuture } from 'utils/dateUtils';
import { IProjectData, PostingDisabledReason } from 'api/projects/types';
import { isAdmin, isProjectModerator } from 'services/permissions/roles';
import { IUserData } from 'api/users/types';
import { IPhaseData } from 'api/phases/types';

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
  | 'maybeNotPermitted'
  | 'futureEnabled'
  | 'notInGroup';

// When disabled but user might get access, here are the next steps for this user
export type AuthenticationRequirements =
  | 'sign_in_up'
  | 'verify'
  | 'sign_in_up_and_verify'
  | 'complete_registration';

const ideaPostingDisabledReason = (
  backendReason: PostingDisabledReason | null,
  signedIn: boolean,
  futureEnabled: string | null
): {
  disabledReason: IIdeaPostingDisabledReason | null;
  authenticationRequirements: AuthenticationRequirements | null;
} => {
  switch (backendReason) {
    case 'missing_data':
      return {
        disabledReason: null,
        authenticationRequirements: 'complete_registration',
      };
    case 'not_in_group':
      return {
        disabledReason: 'notInGroup',
        authenticationRequirements: null,
      };
    case 'not_verified':
      return signedIn
        ? {
            disabledReason: null,
            authenticationRequirements: 'verify',
          }
        : {
            disabledReason: null,
            authenticationRequirements: 'sign_in_up_and_verify',
          };
    case 'not_signed_in':
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
    case 'posting_limited_max_reached':
      return {
        disabledReason: 'postingLimitedMaxReached',
        authenticationRequirements: null,
      };
    case 'not_permitted':
      return {
        disabledReason: signedIn ? 'notPermitted' : 'maybeNotPermitted',
        authenticationRequirements: null,
      };
    case 'not_active':
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
    const { disabled_reason, future_enabled, enabled } =
      project.attributes.action_descriptor.posting_idea;

    if (
      signedIn &&
      (isAdmin({ data: authUser }) || isProjectModerator({ data: authUser }))
    ) {
      return {
        show: true,
        enabled: true,
        disabledReason: null,
        authenticationRequirements: null,
      };
    }

    // timeline
    if (phase) {
      // not an enabled ideation phase
      if (
        !(
          (phase.attributes.participation_method === 'ideation' ||
            phase.attributes.participation_method === 'native_survey') &&
          phase.attributes.posting_enabled &&
          disabled_reason !== 'not_ideation'
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

    // continuous, not an enabled ideation project
    // TODO: Will need to update this section after we add new permissions in back office in i5
    if (!phase && project.attributes.participation_method === 'native_survey') {
      if (!project.attributes.posting_enabled) {
        return {
          show: true,
          enabled: false,
          disabledReason: 'notPermitted',
          authenticationRequirements: null,
        };
      }
      if (disabled_reason) {
        const { disabledReason, authenticationRequirements } =
          ideaPostingDisabledReason(disabled_reason, signedIn, future_enabled);
        if (authenticationRequirements) {
          return {
            authenticationRequirements,
            disabledReason: null,
            show: true,
            enabled: 'maybe',
          };
        }
        if (disabledReason) {
          return {
            disabledReason,
            authenticationRequirements: null,
            show: true,
            enabled: false,
          };
        }
      } else {
        return {
          show: true,
          enabled: true,
          disabledReason: null,
          authenticationRequirements: null,
        };
      }
    }

    if (
      !phase &&
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
      ideaPostingDisabledReason(disabled_reason, signedIn, future_enabled);

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
