import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

const FieldContent = () => {
  return (
    <>
      <Box
        background="#FCFCFC"
        width="100%"
        height="100%"
        border={`1px ${colors.separation} solid`}
        py="20px"
        px="16px"
        display="flex"
      >
        <Box width="50%">TOGGLES</Box>
        <Box width="50%">FIELDS</Box>
      </Box>
    </>
  );
};

export default FieldContent;
