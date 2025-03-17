import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import { FormattedMessage } from 'utils/cl-intl';

import CountryFilter from '../components/CountryFilter';
import ProjectCard from '../components/ProjectCard';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

const PinnedProjects = () => {
  const countryCode = useRansackParam('q[pin_country_code_eq]');

  const { data: projects } = useProjectLibraryProjects(
    {
      'q[pin_country_code_eq]': countryCode,
    },
    { enabled: !!countryCode }
  );

  if (!countryCode || !projects || projects.data.length === 0) {
    // TODO empty state
    return null;
  }

  return (
    <>
      <Title variant="h2" color="primary" mt="0px">
        <FormattedMessage {...messages.highlighted} />
      </Title>
      <Box display="flex" mb="12px">
        <CountryFilter
          value={countryCode}
          placeholderMessage={messages.country}
          onChange={(option) => {
            setRansackParam('q[pin_country_code_eq]', option.value);
          }}
        />
      </Box>
      <Box display="flex" flexDirection="row" gap="12px">
        {projects.data.map((project) => (
          <ProjectCard project={project} key={project.id} showStamp showQuote />
        ))}
      </Box>
    </>
  );
};

export default PinnedProjects;
