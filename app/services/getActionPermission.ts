import { PostingDisabledReason } from './projects';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { GetProjectChildProps } from 'resources/GetProject';
import { GetPhaseChildProps } from 'resources/GetPhase';
import { isNilOrError } from 'utils/helperUtils';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { isAdmin } from 'services/permissions/roles';

// keys in ideas.attributes.action_descriptor
export type IIdeaAction =
  | 'voting_idea'
  | 'commenting_idea'
  | 'comment_voting_idea'
  | 'budgeting';

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
interface ActionPermissionDisabled {
  show: true;
  enabled: false;
  disabledReason: IdeaPostingDisabledReason;
  action: null;
}
interface ActionPermissionMaybe {
  show: true;
  enabled: 'maybe';
  disabledReason: null;
  action: IPreliminaryAction;
}

export type IdeaPostingDisabledReason =
  | 'notPermitted'
  | 'postingDisabled'
  | 'projectInactive'
  | 'notActivePhase'
  | 'futureEnabled';

export type IPreliminaryAction =
  | 'sign_in_up'
  | 'verify'
  | 'sign_in_up_and_verify';

type ActionPermission =
  | ActionPermissionHide
  | ActionPermissionMaybe
  | ActionPermissionEnabled
  | ActionPermissionDisabled;

const ideaPostingDisabledReason = (
  backendReason: PostingDisabledReason | null,
  signedIn: boolean,
  futureEnabled: string | null
): {
  disabledReason: IdeaPostingDisabledReason | null;
  action: IPreliminaryAction | null;
} => {
  switch (backendReason) {
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
        disabledReason: 'notPermitted',
        action: null,
      };
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
}): ActionPermission => {
  const signedIn = !isNilOrError(authUser);
  // TODO check for admin
  const loggedInAsAdmin =
    !isNilOrError(authUser) && isAdmin({ data: authUser });

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
          disabledReason: 'notActivePhase' as IdeaPostingDisabledReason,
          action: null,
        };
      }
    }

    if (
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
    } as ActionPermissionDisabled;
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
