import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';

import NavigationHeader from './components/NavigationHeader';

const CommunityMonitor = () => {
  return (
    <Box background={colors.background}>
      <NavigationHeader />
      <RouterOutlet />
    </Box>
  );
};

export default CommunityMonitor;
