import React, { useState, useEffect, useCallback } from 'react';

// events
import { openSignUpInModal, ISignUpInMetaData } from 'events/openSignUpInModal';
import { openSignUpInModal$ } from './SignUpInModal/events';
import openSignUpInModalIfNecessary from '../utils/openSignUpInModalIfNecessary';

// hooks
import { useLocation } from 'react-router-dom';
// import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import SignUpInModal from './SignUpInModal';

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
  const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>();
  const [initiated, setInitiated] = useState(false);
  const [signUpInModalClosed, setSignUpInModalClosed] = useState(false);

  // const fullscreenModalEnabled = useFeatureFlag({
  //   name: 'franceconnect_login',
  // });

  const fullscreenModalEnabled = true;

  const { pathname, search } = useLocation();

  useEffect(() => {
    const subscription = openSignUpInModal$.subscribe(
      ({ eventValue: newMetaData }) => {
        setMetaData(newMetaData);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
    if (metaData) return;

    if (!authUser.attributes.registration_completed_at) {
      openSignUpInModal({ flow: 'signup' });
    }
  }, [authUser, metaData]);

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
      metaData={metaData}
      onOpened={handleUpdateModalOpened}
      onClosed={handleCloseSignUpInModal}
      fullScreenModal={fullscreenModalEnabled}
    />
  );
};

export default SignUpInContainer;
