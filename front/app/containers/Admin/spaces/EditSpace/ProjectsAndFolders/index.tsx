import React, { useState } from 'react';

import {
  Box,
  Button,
  Title,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { SpaceNode } from 'api/admin_publications/types';
import useTreeView from 'api/admin_publications/useTreeView';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';
import { useParams } from 'utils/router';

import messages from '../messages';

import AddToSpaceModal from './AddToSpaceModal';
import { getAddableNodes } from './getAddableNodes';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const { data: treeView } = useTreeView();
  const { data: authUser } = useAuthUser();
  const { mutateAsync: updateFolder } = useUpdateProjectFolder();
  const { mutateAsync: updateProject } = useUpdateProject();

  const [modalOpened, setModalOpened] = useState(false);

  // Anyone who can access this page can add items, so the button isn't gated
  // further. Removing items from a space is admin-only.
  const canRemoveFromSpace = usePermission({
    item: 'space',
    action: 'remove_projects_and_folders',
  });

  if (!treeView || !spaceId || !authUser) return null;

  const spaceNode = treeView.data.attributes.nodes.find(
    (node): node is SpaceNode => node.type === 'space' && node.id === spaceId
  );

  const nodesInSpace = spaceNode?.children;
  if (!nodesInSpace) return null;

  const addableNodes = getAddableNodes(authUser, treeView);
  const hasAddableNodes = addableNodes.length > 0;

  const handleRemove = async (
    nodeId: string,
    nodeType: 'project' | 'folder'
  ) => {
    if (nodeType === 'project') {
      await updateProject({ projectId: nodeId, space_id: null });
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
        <Tooltip
          disabled={hasAddableNodes}
          content={
            <FormattedMessage {...messages.noAddableProjectsOrFolders} />
          }
        >
          <Button
            icon="plus"
            buttonStyle="secondary-outlined"
            dataCy="e2e-add-to-space-button"
            disabled={!hasAddableNodes}
            onClick={() => setModalOpened(true)}
          >
            {formatMessage(messages.addNewProjectOrFolder)}
          </Button>
        </Tooltip>
      </Box>
      <AddToSpaceModal
        spaceId={spaceId}
        addableNodes={addableNodes}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
      {nodesInSpace.length > 0 ? (
        <TreeView
          nodes={nodesInSpace}
          lockedProjectTooltip={
            canRemoveFromSpace ? messages.lockedProject : undefined
          }
          removeButtonMessage={
            canRemoveFromSpace ? messages.removeFromSpace : undefined
          }
          onRemove={canRemoveFromSpace ? handleRemove : undefined}
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
