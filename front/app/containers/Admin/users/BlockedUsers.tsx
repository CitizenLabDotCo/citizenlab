// Libraries
import React from 'react';

// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

// i18n
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
