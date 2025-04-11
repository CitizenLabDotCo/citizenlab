import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import NavigationBar from './components/NavigationBar';

const CommunityMonitor = () => {
  return (
    <Box background={colors.background}>
      <NavigationBar />
      <RouterOutlet />
    </Box>
  );
};

export default CommunityMonitor;
