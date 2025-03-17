import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { FormattedMessage } from 'utils/cl-intl';

import ProjectCard from '../components/ProjectCard';
import messages from '../messages';

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

  if (!projects || projects.data.length === 0) {
    return null;
  }

  return (
    <>
      <Title variant="h2" color="primary" mt="0px">
        <FormattedMessage {...messages.highlighted} />
      </Title>
      <Box display="flex" flexDirection="row" gap="12px">
        {projects.data.map((project) => (
          <ProjectCard project={project} key={project.id} showStamp showQuote />
        ))}
      </Box>
    </>
  );
};

export default PinnedProjects;
