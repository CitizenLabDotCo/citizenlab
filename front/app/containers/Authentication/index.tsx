import React from 'react';

import { TAuthUser } from 'hooks/useAuthUser';
import SignUpIn from './SignUpIn';
import VerificationModal from './VerificationModal';

interface Props {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
}

const Authentication = ({ authUser, onModalOpenedStateChange }: Props) => {
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
