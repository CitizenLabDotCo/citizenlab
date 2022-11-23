import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SignUpInModal from './SignUpInComponent/SignUpInModal';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { endsWith } from 'lodash-es';
import openSignUpInModalIfNecessary from '../utils/openSignUpInModalIfNecessary';
import { TAuthUser } from 'hooks/useAuthUser';

interface Props {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
}

const SignUpInContainer = ({ authUser, onModalOpenedStateChange }: Props) => {
  const [signUpInModalClosed, setSignUpInModalClosed] = useState(false);
  const [signUpInModalMounted, setSignUpInModalMounted] = useState(false);

  const fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });

  const { pathname, search } = useLocation();

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
