import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdea, IdeaCommentingDisabledReason } from 'api/ideas/types';
import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import globalMessages from 'utils/messages';

import messages from '../../messages';

interface Props {
  phaseId: string | undefined;
  idea: IIdea;
}

const CommentingIdeaDisabled = ({ phaseId, idea }: Props) => {
  const { data: authUser } = useAuthUser();
  const {
    enabled: commentingEnabled,
    disabled_reason: commentingDisabledReason,
  } = idea.data.attributes.action_descriptor.commenting_idea;

  const signUpIn = (flow: 'signin' | 'signup') => {
    if (!phaseId) return;

    triggerAuthenticationFlow({
      flow,
      context: {
        action: 'commenting_idea',
        id: phaseId,
        type: 'phase',
      },
    });
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  const calculateMessageDescriptor = (
    commentingEnabled: boolean,
    commentingDisabledReason: IdeaCommentingDisabledReason | null
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

  const messageDescriptor = calculateMessageDescriptor(
    commentingEnabled,
    commentingDisabledReason
  );

  if (!messageDescriptor) return null;

  return (
    /*
      Normally margins on containers are not done, but this component is local and we would
      otherwise need another intermediary component, because we can't add the Box in the component
      where this is rendered, because it would always render and create whitespace in the UI.
    */
    <Box mb="24px">
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
          }}
        />
      </Warning>
    </Box>
  );
};

export default CommentingIdeaDisabled;
