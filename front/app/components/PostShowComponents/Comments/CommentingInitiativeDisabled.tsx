import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// hooks
import useAuthUser, { TAuthUser } from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useOpenAuthModal from 'hooks/useOpenAuthModal';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { openVerificationModal } from 'events/verificationModal';

const calculateMessageDescriptor = (
  authUser: TAuthUser,
  commentingPermissions: ReturnType<typeof useInitiativesPermissions>
) => {
  const isLoggedIn = !isNilOrError(authUser);
  const authenticationRequirements =
    commentingPermissions?.authenticationRequirements;

  if (commentingPermissions?.enabled === true) {
    return null;
  } else if (
    commentingPermissions?.disabledReason === 'notPermitted' &&
    !isLoggedIn
  ) {
    return messages.commentingInitiativeMaybeNotPermitted;
  } else if (
    commentingPermissions?.disabledReason === 'notPermitted' &&
    isLoggedIn
  ) {
    return messages.commentingInitiativeNotPermitted;
  } else if (authenticationRequirements === 'verify') {
    return messages.commentingDisabledUnverified;
  } else if (
    authUser &&
    authenticationRequirements === 'complete_registration'
  ) {
    return messages.completeRegistrationToComment;
  } else if (authenticationRequirements === 'sign_in_up') {
    return messages.signInToCommentInitiative;
  } else if (authenticationRequirements === 'sign_in_up_and_verify') {
    return messages.signInAndVerifyToCommentInitiative;
  }
  return;
};

const CommentingInitiativesDisabled = () => {
  const authUser = useAuthUser();
  const commentingPermissions = useInitiativesPermissions(
    'commenting_initiative'
  );
  const openAuthModal = useOpenAuthModal();

  const messageDescriptor = calculateMessageDescriptor(
    authUser,
    commentingPermissions
  );

  const onVerify = () => {
    if (commentingPermissions?.authenticationRequirements === 'verify') {
      openVerificationModal({
        context: {
          action: 'commenting_initiative',
          type: 'initiative',
        },
      });
    }
  };

  const signUpIn = (flow: 'signin' | 'signup') => {
    if (isNilOrError(authUser)) {
      openAuthModal({
        flow,
        verification:
          commentingPermissions?.authenticationRequirements ===
          'sign_in_up_and_verify',
        context: {
          action: 'commenting_initiative',
          type: 'initiative',
        },
      });
    }
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
                  openSignUpInModal();
                }}
              >
                <FormattedMessage {...messages.completeRegistrationLinkText} />
              </button>
            ),
            verifyIdentityLink: (
              <button onClick={onVerify}>
                <FormattedMessage {...messages.verifyIdentityLinkText} />
              </button>
            ),
          }}
        />
      </Warning>
    </Box>
  );
};

export default CommentingInitiativesDisabled;
