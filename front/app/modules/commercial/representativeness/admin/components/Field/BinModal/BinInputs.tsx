import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import BinInputsHeader from './BinInputsHeader';

interface Props {
  bins: [number, number][];
}

const BinInputs = ({ bins }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {bins.map((bin, i) => (
      <Box display="flex" flexDirection="row" key={i}>
        <Box width="25%">Age group {i + 1}</Box>
        <Box width="25%">{bin[0]}</Box>
        <Box width="25%">{isFinite(bin[1]) ? bin[1] : ''}</Box>
        <Box width="25%"></Box>
      </Box>
    ))}
  </Box>
);

export default BinInputs;
