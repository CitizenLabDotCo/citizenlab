import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { TEST_DATA_ADDED } from './fakeData';
import ProjectFolderSelect from './ProjectFolderSelect';
import TreeView from './TreeView';

const ProjectsAndFolders = () => {
  // const { spaceId } = useParams();
  // const { data: treeView } = useTreeView(spaceId);

  return (
    <>
      <Title variant="h2" color="primary" mt="0px" mb="20px">
        <FormattedMessage {...messages.projectsAndFoldersAdded} />
      </Title>
      <TreeView nodes={TEST_DATA_ADDED} />
      <Title variant="h3" color="primary" mt="60px" mb="20px">
        <FormattedMessage {...messages.addProjectsAndFolders} />
      </Title>
      <ProjectFolderSelect />
    </>
  );
};

export default ProjectsAndFolders;
