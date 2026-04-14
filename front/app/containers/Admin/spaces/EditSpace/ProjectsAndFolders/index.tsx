import React from 'react';

import { Title, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { SpaceNode } from 'api/admin_publications/types';
import useTreeView from 'api/admin_publications/useTreeView';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage } from 'utils/cl-intl';
import { isSpaceModerator } from 'utils/permissions/roles';

import messages from '../messages';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams();
  const { data: treeView } = useTreeView();
  const { mutate: updateFolder } = useUpdateProjectFolder();
  const { mutate: updateProject } = useUpdateProject();
  const { data: authUser } = useAuthUser();

  const userIsSpaceModerator = isSpaceModerator(authUser);
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
      await updateProject({ projectId: nodeId, space_id: null });
    } else {
      await updateFolder({ projectFolderId: nodeId, space_id: null });
    }
  };

  return (
    <>
      <Title variant="h2" color="primary" mt="0px" mb="20px">
        <FormattedMessage {...messages.projectsAndFoldersAdded} />
      </Title>
      {nodesInSpace.length > 0 ? (
        <TreeView
          nodes={treeView.data.attributes.nodes}
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
