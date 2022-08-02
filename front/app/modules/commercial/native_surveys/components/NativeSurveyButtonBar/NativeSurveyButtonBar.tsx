import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

const NativeSurveyButtonBar = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      paddingY="12px"
      background="white"
      width="100%"
    >
      <Box display="flex" width="630px">
        <Button width="auto" type="submit">
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default NativeSurveyButtonBar;
