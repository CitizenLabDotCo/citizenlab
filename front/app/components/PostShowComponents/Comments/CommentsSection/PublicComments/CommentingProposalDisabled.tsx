import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Warning from 'components/UI/Warning';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const CommentingProposalDisabled = () => {
  const commentingPermissions = useInitiativesPermissions(
    'commenting_initiative'
  );

  // TODO: JS - Getting a id cannot be null here, but possibly not thrown from here
  const messageDescriptor = getPermissionsDisabledMessage(
    'commenting_initiative',
    commentingPermissions?.disabledReason
  );

  const signUpIn = (flow: 'signin' | 'signup') => {
    triggerAuthenticationFlow({
      flow,
      context: {
        action: 'commenting_initiative',
        type: 'initiative',
      },
    });
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  if (!messageDescriptor) return null;

  return (
    /*
      Normally margins on containers are not done, but this component is local and we would
      otherwise need another intermediary component, because we can't add the Box in the component
      where this is rendered, because it would always render and create whitespace in the UI.
    */
    <Box mb="24px">
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
                <FormattedMessage {...messages.completeProfileLinkText} />
              </button>
            ),
            verifyIdentityLink: (
              <button onClick={signUp}>
                <FormattedMessage {...messages.verifyIdentityLinkText} />
              </button>
            ),
          }}
        />
      </Warning>
    </Box>
  );
};

export default CommentingProposalDisabled;
