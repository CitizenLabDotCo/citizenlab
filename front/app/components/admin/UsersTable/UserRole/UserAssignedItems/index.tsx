import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import useTreeView from 'api/admin_publications/useTreeView';
import useDeleteProjectFolderModerator from 'api/project_folder_moderators/useDeleteProjectFolderModerator';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import { IUserData } from 'api/users/types';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import { getModeratedItems } from './utils';

interface Props {
  user: IUserData;
}

const UserAssignedItems = ({ user }: Props) => {
  const { data: treeView } = useTreeView();

  const { mutateAsync: deleteProjectModerator } = useDeleteProjectModerator();
  const { mutateAsync: deleteFolderModerator } =
    useDeleteProjectFolderModerator();

  if (!treeView) return null;

  const { projectsUserModerates, foldersUserModerates, spacesUserModerates } =
    getModeratedItems(user, treeView);

  if (
    projectsUserModerates.length === 0 &&
    foldersUserModerates.length === 0 &&
    spacesUserModerates.length === 0
  ) {
    return (
      <Text>
        <FormattedMessage {...messages.noItemsAssigned} />
      </Text>
    );
  }

  const hasFolders = foldersUserModerates.length > 0;

  const handleRemove = async (
    nodeId: string,
    nodeType: 'project' | 'folder'
  ) => {
    if (nodeType === 'project') {
      await deleteProjectModerator({ projectId: nodeId, userId: user.id });
    } else {
      await deleteFolderModerator({ projectFolderId: nodeId, userId: user.id });
    }
  };

  const userIsAdmin = isAdmin({ data: user });

  return (
    <Box>
      {userIsAdmin && (
        <Text>
          <FormattedMessage {...messages.asAnAdmin} />
        </Text>
      )}
      {hasFolders && (
        <>
          <Title variant="h3" mt={userIsAdmin ? '40px' : '0px'}>
            <FormattedMessage {...messages.foldersUserManages} />
          </Title>
          <Text>
            <FormattedMessage {...messages.thisUserCanManage} />
          </Text>
          <TreeView
            nodes={foldersUserModerates}
            lockedProjectTooltip={messages.lockedProject}
            removeButtonMessage={messages.remove}
            onRemove={handleRemove}
          />
        </>
      )}
      {projectsUserModerates.length > 0 && (
        <>
          <Title variant="h3" mt={hasFolders ? '40px' : '0px'}>
            <FormattedMessage {...messages.projectsUserManages} />
          </Title>
          <TreeView
            nodes={projectsUserModerates}
            removeButtonMessage={messages.remove}
            onRemove={handleRemove}
          />
        </>
      )}
    </Box>
  );
};

export default UserAssignedItems;
