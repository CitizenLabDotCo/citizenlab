import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';

// hooks
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import messages from '../../../messages';

const Projects = () => {
  return (
    <Box bg={colors.background}>
      <Box maxWidth="1150px" margin="0 auto">
        <ProjectAndFolderCards
          publicationStatusFilter={['published', 'archived']}
          showTitle={true}
          layout="dynamic"
        />
      </Box>
    </Box>
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
