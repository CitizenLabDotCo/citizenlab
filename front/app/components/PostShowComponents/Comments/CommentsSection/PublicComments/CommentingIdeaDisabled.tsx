import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { IIdea, IdeaCommentingDisabledReason } from 'api/ideas/types';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import globalMessages from 'utils/messages';

import messages from '../../messages';

interface Props {
  phaseId: string | undefined;
  idea: IIdea;
}

const CommentingIdeaDisabled = ({ phaseId, idea }: Props) => {
  const {
    enabled: commentingEnabled,
    disabled_reason: commentingDisabledReason,
  } = idea.data.attributes.action_descriptors.commenting_idea;

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

  const disabledMessages: {
    [key in IdeaCommentingDisabledReason]?: MessageDescriptor | undefined;
  } = {
    project_inactive: messages.commentingDisabledInactiveProject,
    commenting_disabled: messages.commentingDisabledProject,
    user_not_permitted: messages.commentingDisabledProject,
    user_not_verified: messages.commentingDisabledUnverified,
    user_not_in_group: globalMessages.notInGroup,
    user_blocked: messages.commentingDisabledProject,
    user_not_active: messages.completeProfileToComment,
    user_not_signed_in: messages.signInToComment,
    user_missing_requirements: messages.completeProfileToComment,
    idea_not_in_current_phase: messages.commentingDisabledInCurrentPhase,
  };

  const message =
    commentingDisabledReason && disabledMessages[commentingDisabledReason];

  if (commentingEnabled || !message) return null;

  return (
    /*
      Normally margins on containers are not done, but this component is local and we would
      otherwise need another intermediary component, because we can't add the Box in the component
      where this is rendered, because it would always render and create whitespace in the UI.
    */
    <Box mb="24px">
      <Warning className="e2e-commenting-disabled">
        <FormattedMessage
          {...message}
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
