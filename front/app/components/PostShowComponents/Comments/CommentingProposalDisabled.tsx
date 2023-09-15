import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

const calculateMessageDescriptor = (
  authUser: IUserData | undefined,
  commentingPermissions: ReturnType<typeof useInitiativesPermissions>
) => {
  const isLoggedIn = !isNilOrError(authUser);
  const authenticationRequirements =
    commentingPermissions?.authenticationRequirements;

  if (commentingPermissions?.enabled === true) {
    return null;
  } else if (
    commentingPermissions?.disabledReason === 'not_permitted' &&
    !isLoggedIn
  ) {
    return messages.commentingInitiativeMaybeNotPermitted;
  } else if (
    commentingPermissions?.disabledReason === 'not_permitted' &&
    isLoggedIn
  ) {
    return messages.commentingInitiativeNotPermitted;
  } else if (authenticationRequirements === 'verify') {
    return messages.commentingDisabledUnverified;
  } else if (
    authUser &&
    authenticationRequirements === 'complete_registration'
  ) {
    return messages.completeProfileToComment;
  } else if (authenticationRequirements === 'sign_in_up') {
    return messages.signInToCommentInitiative;
  } else if (authenticationRequirements === 'sign_in_up_and_verify') {
    return messages.signInAndVerifyToCommentInitiative;
  }
  return;
};

const CommentingProposalDisabled = () => {
  const { data: authUser } = useAuthUser();
  const commentingPermissions = useInitiativesPermissions(
    'commenting_initiative'
  );

  const messageDescriptor = calculateMessageDescriptor(
    authUser?.data,
    commentingPermissions
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
    <Box mb="30px">
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
