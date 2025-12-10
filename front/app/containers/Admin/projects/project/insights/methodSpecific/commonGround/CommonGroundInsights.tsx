import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { MethodSpecificInsightProps } from '../types';

import StatementsList from './StatementsList';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  return (
    <Box mt="8px" bg="white">
      <StatementsList phaseId={phaseId} />
    </Box>
  );
};

export default CommonGroundInsights;
