import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import UserManager from 'containers/Admin/users/UserManager';
import UsersHeader from 'containers/Admin/users/UsersHeader';

import messages from './messages';

const Users = () => {
  const { projectId } = useParams() as { projectId: string };

  return (
    <Box className="intercom-project-participants-users">
      <UsersHeader
        title={messages.usersTab}
        subtitle={messages.usersSubtitle}
      />
      <UserManager projectId={projectId} />
    </Box>
  );
};

export default Users;
