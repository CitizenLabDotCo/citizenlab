import React from 'react';

import { TAuthUser } from 'hooks/useAuthUser';
import SignUpIn from './SignUpIn';
import VerificationModal from './VerificationModal';

type Authentication = {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
  onMounted: (id?: string) => void;
};

const Authentication = ({ authUser, onModalOpenedStateChange, onMounted }) => {
  return (
    <>
      <SignUpIn
        authUser={authUser}
        onModalOpenedStateChange={onModalOpenedStateChange}
      />
      <VerificationModal onMounted={onMounted} />
    </>
  );
};

export default Authentication;
