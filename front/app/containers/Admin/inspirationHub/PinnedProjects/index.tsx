import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import ProjectCard from './ProjectCard';

const PinnedProjects = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const countryCode = appConfiguration?.data.attributes.country_code;

  const { data, isLoading } = useProjectLibraryProjects(
    {
      'q[pin_country_code_eq]': countryCode ?? undefined,
    },
    { enabled: !!countryCode }
  );

  if (!data && !isLoading) {
    return null;
  }

  console.log(data);

  return (
    <Box>
      <ProjectCard />
    </Box>
  );
};

export default PinnedProjects;
