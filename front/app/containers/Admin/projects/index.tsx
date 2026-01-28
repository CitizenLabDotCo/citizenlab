import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import HelmetIntl from 'components/HelmetIntl';

import messages from './messages';

const AdminProjectsAndFolders = () => (
  <>
    <HelmetIntl
      title={messages.helmetTitle}
      description={messages.helmetDescription}
    />
    <Box
      id="e2e-projects-admin-container"
      display="flex"
      flexDirection="column"
      flexGrow={1}
    >
      <RouterOutlet />
    </Box>
  </>
);

export default AdminProjectsAndFolders;
