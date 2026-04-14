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

  const hasProjects = projectsUserModerates.length > 0;
  const hasFolders = foldersUserModerates.length > 0;
  const hasSpaces = spacesUserModerates.length > 0;

  if (!hasProjects && !hasFolders && !hasSpaces) {
    return (
      <Text>
        <FormattedMessage {...messages.noItemsAssigned} />
      </Text>
    );
  }

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
        <Text mb="40px">
          <FormattedMessage {...messages.asAnAdmin} />
        </Text>
      )}
      {hasSpaces && (
        <Box mb="40px">
          <Title variant="h3" m="0px">
            <FormattedMessage {...messages.spacesUserManages} />
          </Title>
          <Text>
            <FormattedMessage {...messages.thisUserCanManageSpaces} />
          </Text>
          <TreeView
            nodes={spacesUserModerates}
            lockedProjectTooltip={messages.lockedProjectInSpace}
            lockedFolderTooltip={messages.lockedFolderInSpace}
            removeButtonMessage={messages.remove}
            onRemove={handleRemove}
          />
        </Box>
      )}
      {hasFolders && (
        <Box mb="40px">
          <Title variant="h3" m="0px">
            <FormattedMessage {...messages.foldersUserManages} />
          </Title>
          <Text>
            <FormattedMessage {...messages.thisUserCanManageFolders} />
          </Text>
          <TreeView
            nodes={foldersUserModerates}
            lockedProjectTooltip={messages.lockedProjectInFolder}
            removeButtonMessage={messages.remove}
            onRemove={handleRemove}
          />
        </Box>
      )}
      {hasProjects && (
        <Box mb="40px">
          <Title variant="h3" mb="16px" mt="0px">
            <FormattedMessage {...messages.projectsUserManages} />
          </Title>
          <TreeView
            nodes={projectsUserModerates}
            removeButtonMessage={messages.remove}
            onRemove={handleRemove}
          />
        </Box>
      )}
    </Box>
  );
};

export default UserAssignedItems;
