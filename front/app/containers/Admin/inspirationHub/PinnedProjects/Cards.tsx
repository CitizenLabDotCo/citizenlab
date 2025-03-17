import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { FormattedMessage } from 'utils/cl-intl';

import ProjectCard from '../components/ProjectCard';
import { useRansackParam } from '../utils';

import messages from './messages';

const Cards = () => {
  const countryCode = useRansackParam('q[pin_country_code_eq]');

  const { data: projects } = useProjectLibraryProjects(
    {
      'q[pin_country_code_eq]': countryCode,
    },
    { enabled: !!countryCode }
  );

  if (!countryCode) {
    return (
      <Box>
        <Text color="primary">
          <FormattedMessage {...messages.chooseCountry} />
        </Text>
      </Box>
    );
  }

  if (!projects || projects.data.length === 0) {
    // TODO empty state
    return null;
  }

  return (
    <Box display="flex" flexDirection="row" gap="12px">
      {projects.data.map((project) => (
        <ProjectCard project={project} key={project.id} showStamp showQuote />
      ))}
    </Box>
  );
};

export default Cards;
