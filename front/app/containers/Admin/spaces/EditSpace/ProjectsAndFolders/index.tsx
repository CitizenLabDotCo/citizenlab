import React, { useState } from 'react';

import { Box, Button, Title, Text } from '@citizenlab/cl2-component-library';

import { SpaceNode } from 'api/admin_publications/types';
import useTreeView from 'api/admin_publications/useTreeView';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';
import { isSpaceModerator } from 'utils/permissions/roles';
import { useParams } from 'utils/router';

import messages from '../messages';

import AddToSpaceModal from './AddToSpaceModal';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const { data: treeView } = useTreeView();
  const { mutate: updateFolder } = useUpdateProjectFolder();
  const { mutate: updateProject } = useUpdateProject();
  const { data: authUser } = useAuthUser();

  const [modalOpened, setModalOpened] = useState(false);

  const userIsSpaceModerator = isSpaceModerator(authUser);
  const canManageSpaceContent = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
  });

  if (!treeView || !spaceId) return null;

  const spaceNode = treeView.data.attributes.nodes.find(
    (node): node is SpaceNode => node.type === 'space' && node.id === spaceId
  );

  const nodesInSpace = spaceNode?.children;
  if (!nodesInSpace) return null;

  const handleRemove = async (
    nodeId: string,
    nodeType: 'project' | 'folder'
  ) => {
    if (nodeType === 'project') {
      updateProject({ projectId: nodeId, space_id: null });
    } else {
      updateFolder({ projectFolderId: nodeId, space_id: null });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="20px"
      >
        <Title variant="h2" color="primary" mt="0px" mb="0px">
          <FormattedMessage {...messages.projectsAndFoldersAdded} />
        </Title>
        {canManageSpaceContent && (
          <Button
            icon="plus"
            buttonStyle="secondary-outlined"
            dataCy="e2e-add-to-space-button"
            onClick={() => setModalOpened(true)}
          >
            {formatMessage(messages.addNewProjectOrFolder)}
          </Button>
        )}
      </Box>
      {canManageSpaceContent && (
        <AddToSpaceModal
          spaceId={spaceId}
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
        />
      )}
      {nodesInSpace.length > 0 ? (
        <TreeView
          nodes={nodesInSpace}
          lockedProjectTooltip={
            userIsSpaceModerator ? undefined : messages.lockedProject
          }
          removeButtonMessage={
            userIsSpaceModerator ? undefined : messages.removeFromSpace
          }
          onRemove={userIsSpaceModerator ? undefined : handleRemove}
        />
      ) : (
        <Text>
          <FormattedMessage {...messages.noProjectsAndFolders} />
        </Text>
      )}
    </>
  );
};

export default ProjectsAndFolders;
