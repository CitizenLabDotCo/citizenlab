// Libraries
import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';
// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

import messages from './messages';

const AllUsers = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const searchUser = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  return (
    <>
      <UsersHeader
        onSearch={searchUser}
        title={messages.allUsers}
        subtitle={messages.usersSubtitle}
      />
      <UserManager search={search} />
    </>
  );
};

export default AllUsers;
