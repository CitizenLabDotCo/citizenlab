import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useTreeView from 'api/spaces/useTreeView';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import ProjectFolderSelect from './ProjectFolderSelect';
import TreeView from './TreeView';

const ProjectsAndFolders = () => {
  const { spaceId } = useParams();
  const { data: treeView } = useTreeView(spaceId);

  if (!treeView) return null;

  return (
    <>
      <Title variant="h2" color="primary" mt="0px" mb="20px">
        <FormattedMessage {...messages.projectsAndFoldersAdded} />
      </Title>
      <TreeView nodes={treeView.data.attributes.nodes} />
      <Title variant="h3" color="primary" mt="60px" mb="20px">
        <FormattedMessage {...messages.addProjectsAndFolders} />
      </Title>
      <ProjectFolderSelect />
    </>
  );
};

export default ProjectsAndFolders;
