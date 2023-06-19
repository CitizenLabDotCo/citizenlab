// Libraries
import React from 'react';
// Components
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

import messages from './messages';

const AllUsers = () => (
  <>
    <UsersHeader title={messages.allUsers} subtitle={messages.usersSubtitle} />
    <UserManager />
  </>
);

export default AllUsers;
