import React, { useState, useEffect, useCallback } from 'react';

// events
import { openSignUpInModal } from 'events/openSignUpInModal';
import openSignUpInModalIfNecessary from '../utils/openSignUpInModalIfNecessary';

// hooks
import { useLocation } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import SignUpInModal from './SignUpInComponent/SignUpInModal';

// history
import clHistory from 'utils/cl-router/history';

// utils
import { endsWith } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { TAuthUser } from 'hooks/useAuthUser';

interface Props {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
}

const SignUpInContainer = ({ authUser, onModalOpenedStateChange }: Props) => {
  const [initiated, setInitiated] = useState(false);
  const [signUpInModalClosed, setSignUpInModalClosed] = useState(false);

  const fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });

  const { pathname, search } = useLocation();

  // In case of a SSO response or invite
  useEffect(() => {
    const authUserIsPending = authUser === undefined;
    if (authUserIsPending) return;

    const isAuthError = endsWith(pathname, 'authentication-error');
    const isInvitation = endsWith(pathname, '/invite');

    if (!initiated) {
      openSignUpInModalIfNecessary(
        authUser,
        isAuthError && !signUpInModalClosed,
        isInvitation && !signUpInModalClosed,
        search
      );
    }

    setInitiated(true);
  }, [pathname, search, authUser, signUpInModalClosed, initiated]);

  // In case the user signs in
  useEffect(() => {
    if (isNilOrError(authUser)) return;

    if (!authUser.attributes.registration_completed_at) {
      openSignUpInModal({ flow: 'signup' });
    }
  }, [authUser]);

  // In case of a sign up / in route, open modal and redirect to homepage
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const isSignInRoute = endsWith(pathname, 'sign-in');
    const isSignUpRoute = endsWith(pathname, 'sign-up');
    const isAuthRoute = isSignInRoute || isSignUpRoute;
    if (isAuthRoute && isNilOrError(authUser)) {
      timeout = setTimeout(() => {
        openSignUpInModal({
          flow: isSignInRoute ? 'signin' : 'signup',
        });
      }, 0);
      clHistory.replace('/');
    }

    () => {
      clearTimeout(timeout);
    };
  }, [pathname, authUser]);

  const handleUpdateModalOpened = useCallback(
    (opened: boolean) => {
      onModalOpenedStateChange(opened);
    },
    [onModalOpenedStateChange]
  );

  const handleCloseSignUpInModal = useCallback(() => {
    setSignUpInModalClosed(true);
  }, []);

  return (
    <SignUpInModal
      onOpened={handleUpdateModalOpened}
      onClosed={handleCloseSignUpInModal}
      fullScreenModal={fullscreenModalEnabled}
    />
  );
};

export default SignUpInContainer;
