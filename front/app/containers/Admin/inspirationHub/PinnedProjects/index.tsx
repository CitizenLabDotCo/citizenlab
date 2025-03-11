import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import ProjectCard from './ProjectCard';

const PinnedProjects = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const countryCode = appConfiguration?.data.attributes.country_code;

  const { data: projects } = useProjectLibraryProjects(
    {
      'q[pin_country_code_eq]': countryCode ?? undefined,
    },
    { enabled: !!countryCode }
  );

  if (!countryCode) {
    return null;
  }

  if (!projects) {
    // Add loading state
    return null;
  }

  if (projects.data.length === 0) {
    // Add message for empty state
    return null;
  }

  return (
    <>
      <Title variant="h2" color="primary" mt="0px">
        <FormattedMessage {...messages.highlighted} />
      </Title>
      <Box>
        {projects.data.map((project) => (
          <ProjectCard project={project} key={project.id} />
        ))}
      </Box>
    </>
  );
};

export default PinnedProjects;
