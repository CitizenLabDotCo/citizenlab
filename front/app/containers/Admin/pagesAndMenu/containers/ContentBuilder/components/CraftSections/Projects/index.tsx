import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import messages from '../../../messages';

const Projects = () => {
  return (
    <ProjectAndFolderCards
      publicationStatusFilter={['published', 'archived']}
      showTitle={true}
      layout="dynamic"
    />
  );
};

const ProjectsSettings = () => {
  return (
    <Box
      background="#ffffff"
      my="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    />
  );
};

Projects.craft = {
  related: {
    settings: ProjectsSettings,
  },
  custom: {
    title: messages.projectsTitle,
    noPointerEvents: true,
    noDelete: true,
  },
};

export default Projects;
