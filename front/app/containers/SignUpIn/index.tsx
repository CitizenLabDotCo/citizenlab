import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SignUpInModal from 'components/SignUpIn/SignUpInModal';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { endsWith } from 'lodash-es';
import openSignUpInModalIfNecessary from './utils/openSignUpInModalIfNecessary';
import { TAuthUser } from 'hooks/useAuthUser';
import { openSignUpInModal$ } from 'components/SignUpIn/events';

type SignUpInContainer = {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
};
const SignUpInContainer = ({ authUser, onModalOpenedStateChange }) => {
  const [signUpInModalClosed, setSignUpInModalClosed] = useState(false);
  const [signUpInModalMounted, setSignUpInModalMounted] = useState(false);

  const fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });

  const { pathname, search } = useLocation();

  useEffect(() => {
    const subscription = openSignUpInModal$.subscribe(
      ({ eventValue: metaData }) => {
        // Sometimes we need to still open the sign up/in modal
        // after login is completed, if registration is not complete.
        // But in that case, componentDidUpdate is somehow called before
        // the modal is closed which overwrites the metaData.
        // This slightly dirty hack covers that case.
        if (metaData) {
          return;
        } else {
          // if metaData is undefined, it means we're closing
          // the sign up/in modal.
          setSignUpInModalMounted(false);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const isAuthError = endsWith(pathname, 'authentication-error');
    const isInvitation = endsWith(pathname, '/invite');

    openSignUpInModalIfNecessary(
      authUser,
      isAuthError && !signUpInModalClosed,
      isInvitation && !signUpInModalClosed,
      signUpInModalMounted,
      search
    );
  }, [pathname, search, authUser, signUpInModalClosed, signUpInModalMounted]);

  const handleSignUpInModalMounted = () => {
    setSignUpInModalMounted(true);
  };

  const handleUpdateModalOpened = (opened: boolean) => {
    onModalOpenedStateChange(opened);
  };

  const handleCloseSignUpInModal = () => {
    setSignUpInModalClosed(true);
  };

  return (
    <SignUpInModal
      onMounted={handleSignUpInModalMounted}
      onOpened={handleUpdateModalOpened}
      onClosed={handleCloseSignUpInModal}
      fullScreenModal={fullscreenModalEnabled}
    />
  );
};

export default SignUpInContainer;
