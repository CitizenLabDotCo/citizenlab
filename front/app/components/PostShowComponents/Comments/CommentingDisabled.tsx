import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import T from 'components/T';

// hooks
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';

// services
import { IdeaCommentingDisabledReason } from 'api/ideas/types';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

interface Props {
  projectId: string | null;
  phaseId: string | undefined;
  commentingEnabled: boolean | null;
  commentingDisabledReason: IdeaCommentingDisabledReason | null;
}

const calculateMessageDescriptor = (
  commentingEnabled: boolean | null,
  commentingDisabledReason: IdeaCommentingDisabledReason | null,
  authUser: TAuthUser
) => {
  const isLoggedIn = !isNilOrError(authUser);

  if (commentingEnabled) {
    return null;
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
  } else if (isLoggedIn && commentingDisabledReason === 'not_active') {
    return messages.completeRegistrationToComment;
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
  const authUser = useAuthUser();
  const project = useProject({ projectId });

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
    authUser
  );

  const projectTitle = !isNilOrError(project)
    ? project.attributes.title_multiloc
    : null;

  if (!messageDescriptor) return null;

  return (
    <Box mt="15px" mb="30px" className="e2e-commenting-disabled">
      <Warning>
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
                <FormattedMessage {...messages.completeRegistrationLinkText} />
              </button>
            ),
            verifyIdentityLink: (
              <button onClick={signUp}>
                <FormattedMessage {...messages.verifyIdentityLinkText} />
              </button>
            ),
            projectName: projectTitle && <T value={projectTitle} />,
          }}
        />
      </Warning>
    </Box>
  );
};

export default CommentingDisabled;
