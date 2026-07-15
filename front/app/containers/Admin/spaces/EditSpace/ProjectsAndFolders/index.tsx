import React, { useState } from 'react';

import {
  Box,
  Button,
  Title,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { getModeratedItems } from 'api/admin_publications/getModeratedItems';
import {
  FolderNode,
  ProjectNode,
  SpaceNode,
} from 'api/admin_publications/types';
import useTreeView from 'api/admin_publications/useTreeView';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';
import { isAdmin } from 'utils/permissions/roles';
import { useParams } from 'utils/router';

import messages from '../messages';

import AddToSpaceModal from './AddToSpaceModal';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const { data: treeView } = useTreeView();
  const { data: authUser } = useAuthUser();
  const { mutate: updateFolder } = useUpdateProjectFolder();
  const { mutate: updateProject } = useUpdateProject();

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

  // A project or folder can be added when it sits at the root of the tree (not
  // in any space) and the current user is allowed to manage it: admins can
  // manage everything, moderators only the items they moderate. This mirrors
  // what the backend authorizes, so we never offer a project that would 401.
  const { projectsUserModerates, foldersUserModerates } = getModeratedItems(
    authUser.data,
    treeView
  );
  const moderatedIds = new Set(
    [...projectsUserModerates, ...foldersUserModerates].map((node) => node.id)
  );
  const userIsAdmin = isAdmin(authUser);

  const addableNodes = treeView.data.attributes.nodes.filter(
    (node): node is ProjectNode | FolderNode =>
      (node.type === 'project' || node.type === 'folder') &&
      (userIsAdmin || moderatedIds.has(node.id))
  );
  const hasAddableNodes = addableNodes.length > 0;

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
