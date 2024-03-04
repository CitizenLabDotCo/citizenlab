import React from 'react';

import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

import messages from './messages';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

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
