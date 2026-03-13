import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from './messages';
import UserManager from './_shared/UserManager';
import UsersHeader from './_shared/UsersHeader';

export default () => {
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });

  if (!isUserBlockingEnabled) return null;

  return (
    <>
      <UsersHeader
        title={messages.blockedUsers}
        subtitle={messages.blockedUsersSubtitle}
      />
      <UserManager onlyBlocked />
    </>
  );
};
