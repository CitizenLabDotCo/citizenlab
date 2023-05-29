import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import messages from './messages';
import Outlet from 'components/Outlet';
import { Outlet as RouterOutlet } from 'react-router-dom';
import HelmetIntl from 'components/HelmetIntl';

export const ToolsIndex = () => (
  <>
    <Outlet id="app.containers.admin.tools" />
    <HelmetIntl title={messages.tools} description={messages.tools} />
    <Box>
      <RouterOutlet />
    </Box>
  </>
);

export default ToolsIndex;
