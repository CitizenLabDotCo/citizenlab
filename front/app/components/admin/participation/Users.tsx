import React from 'react';

import { useParams } from 'react-router-dom';

import UserManager from 'containers/Admin/users/UserManager';
import UsersHeader from 'containers/Admin/users/UsersHeader';

import messages from './messages';

const Users = () => {
  const { projectId } = useParams() as { projectId: string };

  return (
    <div className="intercom-project-participants-users">
      <UsersHeader
        title={messages.usersTab}
        subtitle={messages.usersSubtitle}
      />
      <UserManager projectId={projectId} />
    </div>
  );
};

export default Users;
