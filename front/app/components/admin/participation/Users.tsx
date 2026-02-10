import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import UserManager from 'containers/Admin/users/UserManager';
import UsersHeader from 'containers/Admin/users/UsersHeader';

import messages from './messages';

const Users = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };

  return (
    <Box className="intercom-project-participants-users">
      <UsersHeader
        title={messages.participantsTab}
        subtitle={messages.usersSubtitle}
      />
      <UserManager projectId={projectId} />
    </Box>
  );
};

export default Users;
