import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import UserManager from '../_shared/UserManager';
import UsersHeader from '../_shared/UsersHeader';
import messages from '../messages';

const AllUsers = () => (
  <Box className="intercom-users-registered-users">
    <UsersHeader title={messages.allUsers} subtitle={messages.usersSubtitle} />
    <UserManager />
  </Box>
);

export default AllUsers;
