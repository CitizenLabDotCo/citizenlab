import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import InputsByTopic from '../shared/InputsByTopic';
import StatusBreakdown from '../shared/StatusBreakdown';
import { MethodSpecificInsightProps } from '../types';

const ProposalsInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  return (
    <Box display="flex" gap="16px" my="12px" bg="white">
      <Box w="100%">
        <StatusBreakdown phaseId={phaseId} participationMethod="proposals" />
      </Box>
      <Box w="100%">
        <InputsByTopic phaseId={phaseId} />
      </Box>
    </Box>
  );
};

export default ProposalsInsights;
