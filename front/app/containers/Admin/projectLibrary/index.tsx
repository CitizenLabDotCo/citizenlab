import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/sideBar/messages';

import { FormattedMessage } from 'utils/cl-intl';

import ProjectTable from './ProjectTable';

const ProjectLibrary = () => {
  return (
    <Box>
      <Title variant="h1" color="primary">
        <FormattedMessage {...messages.projectLibrary} />
      </Title>
      <Box>
        <ProjectTable />
      </Box>
    </Box>
  );
};

export default ProjectLibrary;
