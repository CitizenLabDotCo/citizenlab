import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import useTreeView from 'api/spaces/useTreeView';
import { IUserData } from 'api/users/types';

import TreeView from 'components/admin/TreeView';

import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import { getLists as getModeratedItems } from './utils';

interface Props {
  user: IUserData;
}

const UserAssignedItems = ({ user }: Props) => {
  const { data: treeView } = useTreeView();

  if (!treeView) return null;

  const { projectsUserModerates, foldersUserModerates } = getModeratedItems(
    user,
    treeView
  );

  if (isAdmin({ data: user })) {
    return (
      <Text>As an admin, this user can moderate all folders and projects.</Text>
    );
  }

  return (
    <Box>
      <Title variant="h3" mt="0px">
        Folders user manages
      </Title>
      <Text>
        This user can manage the following folders, including the projects
        inside of them:
      </Text>
      <TreeView
        nodes={foldersUserModerates}
        lockedProjectTooltip={messages.lockedProject}
        removeButtonMessage={messages.remove}
      />
      <Title variant="h3" mt="40px">
        Projects user manages
      </Title>
      <TreeView
        nodes={projectsUserModerates}
        removeButtonMessage={messages.remove}
      />
    </Box>
  );
};

export default UserAssignedItems;
