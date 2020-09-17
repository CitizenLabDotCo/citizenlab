import { PostingDisabledReasons } from './projects';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { GetProjectChildProps } from 'resources/GetProject';
import { GetPhaseChildProps } from 'resources/GetPhase';
import { isNilOrError } from 'utils/helperUtils';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { isAdmin } from 'services/permissions/roles';

export type DisabledReasons =
  | 'notPermitted'
  | 'postingDisabled'
  | 'projectInactive'
  | 'notActivePhase'
  | 'futureEnabled';

export type ActionReasons =
  | 'maybeNotPermitted'
  | 'notVerified'
  | 'maybeNotVerified';

interface PostingButtonStateArg {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  authUser: GetAuthUserChildProps;
}

const disabledReason = (
  backendReason: PostingDisabledReasons | null,
  signedIn: boolean,
  futureEnabled: string | null
): DisabledReasons | ActionReasons | null => {
  switch (backendReason) {
    case 'project_inactive':
      return 'projectInactive';
    case 'posting_disabled':
      return 'postingDisabled';
    case 'not_verified':
      return signedIn ? 'maybeNotVerified' : 'notVerified';
    case 'not_signed_in':
      return 'maybeNotPermitted';
    case 'not_permitted':
      return 'notPermitted';
    default:
      return futureEnabled ? 'futureEnabled' : null;
  }
};

/** Should we show and/or disable the idea posting button in the given context. And with what message?
 * @param context
 *  project: The project context we are posting to.
 *  phase: The phase context in which the button is rendered. NOT necessarily the active phase. Optional.
 *  authUser: The currently authenticated user
 */
export const getIdeaPostingRules = ({
  project,
  phase,
  authUser,
}: PostingButtonStateArg) => {
  const signedIn = !isNilOrError(authUser);
  const loggedInAsAdmin =
    !isNilOrError(authUser) && isAdmin({ data: authUser });

  // Timeline project
  if (!isNilOrError(project) && !isNilOrError(phase)) {
    // is the selected phase currently active ?
    const inCurrentPhase =
      pastPresentOrFuture([
        phase.attributes.start_at,
        phase.attributes.end_at,
      ]) === 'present';
    const {
      disabled_reason,
      future_enabled,
      enabled,
    } = project.attributes.action_descriptor.posting_idea;

    if (inCurrentPhase) {
      return {
        enabled,
        show:
          phase.attributes.participation_method === 'ideation' &&
          phase.attributes.posting_enabled &&
          disabled_reason !== 'not_ideation',
        disabledReason: disabledReason(
          disabled_reason,
          signedIn,
          future_enabled
        ),
      };
    }

    // if not in current phase
    return {
      show:
        phase.attributes.participation_method === 'ideation' &&
        phase.attributes.posting_enabled &&
        disabled_reason !== 'not_ideation',
      enabled: false,
      disabledReason: 'notActivePhase' as DisabledReasons,
    };
  } else if (!isNilOrError(project) && isNilOrError(phase)) {
    // if not in phase context
    const enabled =
      loggedInAsAdmin ||
      project.attributes.action_descriptor.posting_idea?.enabled;
    const { disabled_reason, future_enabled } = project.attributes
      .action_descriptor?.posting_idea || {
      disabled_reason: null,
      future_enabled: null,
    };

    return {
      enabled,
      show:
        project.attributes.participation_method === 'ideation' &&
        project.attributes.posting_enabled &&
        disabled_reason !== 'not_ideation',
      disabledReason: enabled
        ? undefined
        : disabledReason(disabled_reason, signedIn, future_enabled),
    };
  } else {
    // if !project
    return {
      show: true,
      enabled: true,
    };
  }
};
