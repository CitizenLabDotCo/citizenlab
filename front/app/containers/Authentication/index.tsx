import React from 'react';

import { TAuthUser } from 'hooks/useAuthUser';
import SignUpIn from './SignUpIn';

type Authentication = {
  authUser: TAuthUser;
  onModalOpenedStateChange: (isOpened: boolean) => void;
};

const Authentication = ({ authUser, onModalOpenedStateChange }) => {
  return (
    <SignUpIn
      authUser={authUser}
      onModalOpenedStateChange={onModalOpenedStateChange}
    />
  );
};

export default Authentication;
