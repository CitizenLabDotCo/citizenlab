import React from 'react';

import messages from './messages';
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

const AllUsers = () => (
  <>
    <UsersHeader title={messages.allUsers} subtitle={messages.usersSubtitle} />
    <UserManager />
  </>
);

export default AllUsers;
