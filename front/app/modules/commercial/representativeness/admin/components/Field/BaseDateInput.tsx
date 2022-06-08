import React from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';

// styling
import { colors } from '@citizenlab/cl2-component-library';

const BaseDateInput = () => (
  <Box display="flex" mt="28px">
    <Box width="50%">
      <Icon name="calendar" width="16px" height="16px" fill={colors.label} />
    </Box>
    <Box width="50%"></Box>
  </Box>
);

export default BaseDateInput;
