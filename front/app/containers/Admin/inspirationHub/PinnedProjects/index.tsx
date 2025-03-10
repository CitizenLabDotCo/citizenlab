import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import ProjectCard from './ProjectCard';

const PinnedProjects = () => {
  const { data: projects } = useProjectLibraryProjects({});

  console.log({ projects });

  return (
    <Box>
      <ProjectCard />
    </Box>
  );
};

export default PinnedProjects;
