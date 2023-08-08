import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Confetti from './confetti.svg';

const ConfettiSvg = () => {
  return (
    <Box display="flex">
      <img src={Confetti} alt="confetti animation" />
    </Box>
  );
};

export default ConfettiSvg;
