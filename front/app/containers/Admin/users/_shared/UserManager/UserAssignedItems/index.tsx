import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import useDeleteProjectFolderModerator from 'api/project_folder_moderators/useDeleteProjectFolderModerator';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import useTreeView from 'api/spaces/useTreeView';
import { IUserData } from 'api/users/types';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import { getLists as getModeratedItems } from './utils';

interface Props {
  user: IUserData;
}

const UserAssignedItems = ({ user }: Props) => {
  const { data: treeView } = useTreeView();

  const { mutateAsync: deleteProjectModerator } = useDeleteProjectModerator();
  const { mutateAsync: deleteFolderModerator } =
    useDeleteProjectFolderModerator();

  if (!treeView) return null;

  const { projectsUserModerates, foldersUserModerates } = getModeratedItems(
    user,
    treeView
  );

  if (isAdmin({ data: user })) {
    return (
      <Text>
        <FormattedMessage {...messages.asAnAdmin} />
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

  return (
    <Box>
      {hasFolders && (
        <>
          <Title variant="h3" mt="0px">
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
