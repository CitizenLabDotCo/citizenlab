import React from 'react';

// components
import { Box, colors, media } from '@citizenlab/cl2-component-library';

// hooks
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import messages from '../../../messages';
import styled from 'styled-components';

const ProjectSection = styled.div`
  width: 100%;
  padding-top: 40px;
  padding-bottom: 40px;

  ${media.phone`
    padding-bottom: 40px;
    padding-left:20px;
    padding-right:20px;
  `}
`;

const Projects = () => {
  return (
    <Box bg={colors.background}>
      <Box maxWidth="1150px" margin="0 auto">
        <ProjectSection>
          <ProjectAndFolderCards
            publicationStatusFilter={['published', 'archived']}
            showTitle={true}
            layout="dynamic"
          />
        </ProjectSection>
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
