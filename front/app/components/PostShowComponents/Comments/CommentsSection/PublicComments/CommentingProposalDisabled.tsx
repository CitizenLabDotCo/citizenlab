import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Warning from 'components/UI/Warning';

import actionDescriptorMessages from 'utils/actionDescriptors/messages';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

const CommentingProposalDisabled = () => {
  const { data: authUser } = useAuthUser();
  const commentingPermissions = useInitiativesPermissions(
    'commenting_initiative'
  );

  // NOTE: The use of actionDescriptorMessages temporary until initiative comments moved centrally to actionDescriptors utils
  const calculateMessageDescriptor = (
    commentingPermissions: ReturnType<typeof useInitiativesPermissions>
  ) => {
    const isLoggedIn = !isNilOrError(authUser);
    const authenticationRequirements =
      commentingPermissions?.authenticationRequirements;

    if (commentingPermissions?.enabled === true) {
      return null;
    } else if (
      commentingPermissions?.disabledReason === 'user_not_permitted' &&
      !isLoggedIn
    ) {
      return messages.commentingInitiativeMaybeNotPermitted;
    } else if (
      commentingPermissions?.disabledReason === 'user_not_permitted' &&
      isLoggedIn
    ) {
      return messages.commentingInitiativeNotPermitted;
    } else if (authenticationRequirements === 'verify') {
      return actionDescriptorMessages.commentingDisabledUnverified;
    } else if (
      authUser &&
      authenticationRequirements === 'complete_registration'
    ) {
      return actionDescriptorMessages.completeProfileToComment;
    } else if (authenticationRequirements === 'sign_in_up') {
      return messages.signInToCommentInitiative;
    } else if (authenticationRequirements === 'sign_in_up_and_verify') {
      return messages.signInAndVerifyToCommentInitiative;
    }
    return;
  };

  const messageDescriptor = calculateMessageDescriptor(commentingPermissions);

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
