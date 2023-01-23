import React from 'react';

import { TAuthUser } from 'hooks/useAuthUser';
import SignUpIn from './SignUpIn';
import VerificationModal from './VerificationModal';

type Authentication = {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
};

const Authentication = ({ authUser, onModalOpenedStateChange }) => {
  return (
    <>
      <SignUpIn
        authUser={authUser}
        onModalOpenedStateChange={onModalOpenedStateChange}
      />
      <VerificationModal />
    </>
  );
};

export default Authentication;
