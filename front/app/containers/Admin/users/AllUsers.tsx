import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import messages from './messages';
import UserManager from './UserManager';
import UsersHeader from './UsersHeader';

const AllUsers = () => (
  <Box className="intercom-users-registered-users">
    <UsersHeader title={messages.allUsers} subtitle={messages.usersSubtitle} />
    <UserManager />
  </Box>
);

export default AllUsers;
