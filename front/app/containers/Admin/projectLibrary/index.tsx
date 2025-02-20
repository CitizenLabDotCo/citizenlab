import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import messages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';

import Filters from './Filters';
import ProjectTable from './ProjectTable';
import { useRansackParams } from './utils';

const ProjectLibrary = () => {
  const {
    data: libraryProjects,
    isInitialLoading,
    isRefetching,
  } = useProjectLibraryProjects(useRansackParams());

  return (
    <Box>
      <Title variant="h1" color="primary" mb="40px">
        <FormattedMessage {...messages.projectLibrary} />
      </Title>
      <Box>
        <Box mb="24px">
          <Filters />
        </Box>
        <ProjectTable
          libraryProjects={libraryProjects}
          isInitialLoading={isInitialLoading}
          isRefetching={isRefetching}
        />
      </Box>
    </Box>
  );
};

export default ProjectLibrary;
