import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryProjects from 'api/project_library_projects/useProjectLibraryProjects';

import messages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';

import Filters from './Filters';
import ProjectTable from './ProjectTable';

const ProjectLibrary = () => {
  const { data: libraryProjects } = useProjectLibraryProjects({});
  return (
    <Box>
      <Title variant="h1" color="primary" mb="40px">
        <FormattedMessage {...messages.projectLibrary} />
      </Title>
      <Box>
        <Box mb="24px">
          <Filters />
        </Box>
        {libraryProjects && <ProjectTable libraryProjects={libraryProjects} />}
      </Box>
    </Box>
  );
};

export default ProjectLibrary;
