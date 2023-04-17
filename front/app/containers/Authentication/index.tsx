import React from 'react';

import { TAuthUser } from 'hooks/useAuthUser';
import SignUpIn from './SignUpIn';

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
    </>
  );
};

export default Authentication;
