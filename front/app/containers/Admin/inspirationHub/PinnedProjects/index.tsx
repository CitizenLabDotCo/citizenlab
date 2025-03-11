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

  const { data } = useProjectLibraryProjects(
    {
      'q[pin_country_code_eq]': countryCode ?? undefined,
    },
    { enabled: !!countryCode }
  );

  if (!countryCode) {
    return null;
  }

  if (!data) {
    // Add loading state
  }

  return (
    <>
      <Title variant="h2" color="primary" mt="0px">
        <FormattedMessage {...messages.highlighted} />
      </Title>
      <Box>
        <ProjectCard />
      </Box>
    </>
  );
};

export default PinnedProjects;
