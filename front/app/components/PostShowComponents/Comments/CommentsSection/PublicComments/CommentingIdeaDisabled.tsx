import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdea } from 'api/ideas/types';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Warning from 'components/UI/Warning';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phaseId: string | undefined;
  idea: IIdea;
  onUnauthenticatedClick?: () => void;
}

const CommentingIdeaDisabled = ({
  phaseId,
  idea,
  onUnauthenticatedClick,
}: Props) => {
  const {
    enabled: commentingEnabled,
    disabled_reason: commentingDisabledReason,
  } = idea.data.attributes.action_descriptors.commenting_idea;

  const signUpIn = (flow: 'signin' | 'signup') => {
    onUnauthenticatedClick?.();
    if (!phaseId) return;

    triggerAuthenticationFlow(
      {
        context: {
          action: 'commenting_idea',
          id: phaseId,
          type: 'phase',
        },
      },
      flow
    );
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  const disabledMessage = getPermissionsDisabledMessage(
    'commenting_idea',
    commentingDisabledReason
  );

  if (commentingEnabled || !disabledMessage) return null;

  return (
    /*
      Normally margins on containers are not done, but this component is local and we would
      otherwise need another intermediary component, because we can't add the Box in the component
      where this is rendered, because it would always render and create whitespace in the UI.
    */
    <Box mb="24px">
      <Warning className="e2e-commenting-disabled">
        <FormattedMessage
          {...disabledMessage}
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
