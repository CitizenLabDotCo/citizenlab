// Libraries
import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';

// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

// i18n
import messages from './messages';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

export default () => {
  const [search, setSearch] = useState<string>('');
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });

  const searchUser = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  if (!isUserBlockingEnabled) return null;

  return (
    <>
      <UsersHeader
        title={messages.blockedUsers}
        subtitle={messages.blockedUsersSubtitle}
        onSearch={searchUser}
      />
      <UserManager onlyBlocked={true} search={search} />
    </>
  );
};
