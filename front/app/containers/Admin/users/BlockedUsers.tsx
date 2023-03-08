// Libraries
import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';
import { useIntl } from 'utils/cl-intl';

// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

// i18n
import messages from './messages';

const AllUsers = () => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState<string | undefined>(undefined);

  const searchUser = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  return (
    <>
      <UsersHeader
        title={formatMessage(messages.blockedUsers)}
        subtitle={formatMessage(messages.blockedUsersSubtitle)}
        onSearch={searchUser}
      />
      <UserManager search={search} />
    </>
  );
};

export default AllUsers;
