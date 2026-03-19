import React from 'react';

import { Title, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';
import useTreeView from 'api/admin_publications/useTreeView';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams();
  const { data: treeView } = useTreeView(spaceId);
  const { mutate: updateFolder } = useUpdateProjectFolder();
  const { mutate: updateProject } = useUpdateProject();

  if (!treeView) return null;

  const { nodes } = treeView.data.attributes;

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
      {nodes.length > 0 ? (
        <TreeView
          nodes={treeView.data.attributes.nodes}
          lockedProjectTooltip={messages.lockedProject}
          removeButtonMessage={messages.removeFromSpace}
          onRemove={handleRemove}
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
