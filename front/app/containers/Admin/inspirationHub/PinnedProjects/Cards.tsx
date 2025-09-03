import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { FormattedMessage } from 'utils/cl-intl';

import ProjectCard from '../components/ProjectCard';
import { useRansackParam } from '../utils';

import messages from './messages';

const Cards = () => {
  const countryCode = useRansackParam('q[pin_country_code_eq]');

  const { data: projects, isLoading } = useProjectLibraryProjects(
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

  if (isLoading) return null;
  if (!projects) return null;

  if (projects.data.length === 0) {
    return (
      <Box>
        <Text color="primary">
          <FormattedMessage {...messages.noPinnedProjectsFound} />
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {projects.data.length < 3 && (
        <Text color="primary">
          <FormattedMessage {...messages.changeTheCountry} />
        </Text>
      )}
      <Box display="flex" flexDirection="row" gap="12px">
        {projects.data.map((project) => (
          <ProjectCard project={project} key={project.id} isHighlighted />
        ))}
      </Box>
    </Box>
  );
};

export default Cards;
