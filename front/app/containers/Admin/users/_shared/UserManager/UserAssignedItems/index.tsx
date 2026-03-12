import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useTreeView from 'api/spaces/useTreeView';
import { IUserData } from 'api/users/types';

import TreeView from 'containers/Admin/spaces/EditSpace/ProjectsAndFolders/TreeView';

import { getLists as getModeratedItems } from './utils';

interface Props {
  user: IUserData;
}

const UserAssignedItems2 = ({ user }: Props) => {
  const { data: treeView } = useTreeView();

  if (!treeView) return null;

  const { projectsUserModerates, foldersUserModerates } = getModeratedItems(
    user,
    treeView
  );

  return (
    <Box>
      <Title variant="h3">Folders user moderates</Title>
      <TreeView nodes={foldersUserModerates} />
      <Title variant="h3">Projects user moderates</Title>
      <TreeView nodes={projectsUserModerates} />
    </Box>
  );
};

export default UserAssignedItems2;
