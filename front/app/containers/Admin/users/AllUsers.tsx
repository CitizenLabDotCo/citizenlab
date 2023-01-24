// Libraries
import React, { useState } from 'react';
import { isString, isEmpty } from 'lodash-es';

// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

const AllUsers = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const searchUser = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  return (
    <>
      <UsersHeader onSearch={searchUser} />
      <UserManager search={search} />
    </>
  );
};

export default AllUsers;
