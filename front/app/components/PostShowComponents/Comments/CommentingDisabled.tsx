import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Warning from 'components/UI/Warning';
import T from 'components/T';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';
import useProjectById from 'api/projects/useProjectById';

// services
import { IdeaCommentingDisabledReason } from 'api/ideas/types';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import globalMessages from 'utils/messages';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

interface Props {
  projectId: string | null;
  phaseId: string | undefined;
  commentingEnabled: boolean;
  commentingDisabledReason: IdeaCommentingDisabledReason | null;
}

const calculateMessageDescriptor = (
  commentingEnabled: boolean,
  commentingDisabledReason: IdeaCommentingDisabledReason | null,
  authUser: IUserData | undefined
) => {
  const isLoggedIn = !isNilOrError(authUser);

  if (commentingEnabled) {
    return null;
  } else if (commentingDisabledReason === 'not_in_group') {
    return globalMessages.notInGroup;
  } else if (commentingDisabledReason === 'project_inactive') {
    return messages.commentingDisabledInactiveProject;
  } else if (commentingDisabledReason === 'commenting_disabled') {
    return messages.commentingDisabledProject;
  } else if (commentingDisabledReason === 'idea_not_in_current_phase') {
    return messages.commentingDisabledInCurrentPhase;
  } else if (isLoggedIn && commentingDisabledReason === 'not_verified') {
    return messages.commentingDisabledUnverified;
  } else if (isLoggedIn && commentingDisabledReason === 'not_permitted') {
    return messages.commentingDisabledProject;
  } else if (
    (isLoggedIn && commentingDisabledReason === 'not_active') ||
    commentingDisabledReason === 'missing_data'
  ) {
    return messages.completeProfileToComment;
  } else if (!isLoggedIn) {
    return messages.commentingMaybeNotPermitted;
  }
  return messages.signInToComment;
};

const CommentingDisabled = ({
  projectId,
  phaseId,
  commentingEnabled,
  commentingDisabledReason,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);

  const signUpIn = (flow: 'signin' | 'signup') => {
    const pcType = phaseId ? 'phase' : projectId ? 'project' : null;
    const pcId =
      pcType === 'phase' ? phaseId : pcType === 'project' ? projectId : null;

    if (!pcId || !pcType) return;

    triggerAuthenticationFlow({
      flow,
      context: {
        action: 'commenting_idea',
        id: pcId,
        type: pcType,
      },
    });
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  const messageDescriptor = calculateMessageDescriptor(
    commentingEnabled,
    commentingDisabledReason,
    authUser?.data
  );

  const projectTitle = project?.data.attributes.title_multiloc;

  if (!messageDescriptor) return null;

  return (
    <Warning className="e2e-commenting-disabled">
      <FormattedMessage
        {...messageDescriptor}
        values={{
          signUpLink: (
            <button onClick={signUp}>
              <FormattedMessage {...messages.signUpLinkText} />
            </button>
          ),
          signInLink: (
            <button onClick={signIn}>
              <FormattedMessage {...messages.signInLinkText} />
            </button>
          ),
          completeRegistrationLink: (
            <button
              onClick={() => {
                triggerAuthenticationFlow();
              }}
            >
              <FormattedMessage {...messages.completeProfileLinkText} />
            </button>
          ),
          verifyIdentityLink: (
            <button id="e2e-verify-identity-to-comment" onClick={signUp}>
              <FormattedMessage {...messages.verifyIdentityLinkText} />
            </button>
          ),
          projectName: projectTitle && <T value={projectTitle} />,
        }}
      />
    </Warning>
  );
};

export default CommentingDisabled;
