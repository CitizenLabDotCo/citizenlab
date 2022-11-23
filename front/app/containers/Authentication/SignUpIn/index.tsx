import React, { useState, useEffect } from 'react';

// components
import SignUpInModal from './SignUpInComponent/SignUpInModal';
import useFeatureFlag from 'hooks/useFeatureFlag';

// hooks
import { useLocation } from 'react-router-dom';
import { endsWith } from 'lodash-es';

// utils
import openSignUpInModalIfNecessary from '../utils/openSignUpInModalIfNecessary';

// typings
import { IUserData } from 'services/users';

interface Props {
  authUser: IUserData | null | undefined;
  onModalOpenedStateChange: (isOpened: boolean) => void;
}

const SignUpInContainer = ({ authUser, onModalOpenedStateChange }: Props) => {
  const [hasCheckedIfModalShouldBeOpened, setHasCheckedIfModalShouldBeOpened] =
    useState(false);

  const fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });

  const { pathname, search } = useLocation();

  useEffect(() => {
    const authUserPending = authUser === undefined;
    if (authUserPending) return;
    if (hasCheckedIfModalShouldBeOpened) return;

    const isAuthError = endsWith(pathname, 'authentication-error');
    const isInvitation = endsWith(pathname, '/invite');

    openSignUpInModalIfNecessary(authUser, isAuthError, isInvitation, search);

    setHasCheckedIfModalShouldBeOpened(true);
  }, [pathname, search, authUser, hasCheckedIfModalShouldBeOpened]);

  const handleUpdateModalOpened = (opened: boolean) => {
    onModalOpenedStateChange(opened);
  };

  return (
    <SignUpInModal
      onOpened={handleUpdateModalOpened}
      fullScreenModal={fullscreenModalEnabled}
    />
  );
};

export default SignUpInContainer;
