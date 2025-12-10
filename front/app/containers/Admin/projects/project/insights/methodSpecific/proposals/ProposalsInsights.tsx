import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { MethodSpecificInsightProps } from '../types';

import ProposalStatusBreakdown from './ProposalStatusBreakdown';

const ProposalsInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  return (
    <Box my="12px" bg="white">
      <ProposalStatusBreakdown phaseId={phaseId} />
    </Box>
  );
};

export default ProposalsInsights;
