import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

// routing
import { Outlet as RouterOutlet } from 'react-router-dom';

export default () => {
  return (
    <Box display="flex" justifyContent="center">
      <Box w="600px" background={colors.grey200} m="20px" p="20px">
        <RouterOutlet />
      </Box>
    </Box>
  );
};
