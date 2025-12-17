import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { MethodSpecificInsightProps } from '../types';

import VoteResults from './VoteResults';

const VotingInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  return (
    <Box my="12px" bg="white">
      <VoteResults phaseId={phaseId} />
    </Box>
  );
};

export default VotingInsights;
