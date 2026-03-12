import React from 'react';

import { Title, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useTreeView from 'api/spaces/useTreeView';

import TreeView from 'components/admin/TreeView';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams();
  const { data: treeView } = useTreeView(spaceId);

  if (!treeView) return null;

  const { nodes } = treeView.data.attributes;

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
