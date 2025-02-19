import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

const ProjectLibrary = () => {
  const { data: libraryProjects } = useProjectLibraryProjects({});

  return (
    <Box>
      <Title variant="h1" color="primary">
        Project Library
      </Title>
      <ul>
        {libraryProjects?.data.map((project) => (
          <li key={project.id}>{project.attributes.title_en}</li>
        ))}
      </ul>
    </Box>
  );
};

export default ProjectLibrary;
