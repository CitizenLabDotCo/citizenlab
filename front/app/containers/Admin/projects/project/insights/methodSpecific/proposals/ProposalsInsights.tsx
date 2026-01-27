import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import AiSummary from '../ideation/AiSummary';
import StatusBreakdown from '../shared/StatusBreakdown';
import TopicBreakdown from '../shared/TopicBreakdown';
import { MethodSpecificInsightProps } from '../types';

import MostLikedProposals from './MostLikedProposals';

const ProposalsInsights = ({
  phaseId,
  isPdfExport = false,
}: MethodSpecificInsightProps) => {
  if (isPdfExport) {
    return (
      <Box mt="16px" display="flex" flexDirection="column" gap="24px">
        <AiSummary phaseId={phaseId} isPdfExport />
        <TopicBreakdown phaseId={phaseId} />
        <MostLikedProposals phaseId={phaseId} />
        <StatusBreakdown phaseId={phaseId} participationMethod="proposals" />
      </Box>
    );
  }

  return (
    <Box mt="16px" gap="24px">
      <Box display="flex" gap="16px" w="100%">
        <Box w="100%">
          <AiSummary phaseId={phaseId} />
        </Box>
        <Box w="100%">
          <TopicBreakdown phaseId={phaseId} />
        </Box>
      </Box>
      <Box display="flex" gap="16px" w="100%" flexDirection="row">
        <Box w="100%">
          <MostLikedProposals phaseId={phaseId} />
        </Box>
        <Box w="100%">
          <StatusBreakdown phaseId={phaseId} participationMethod="proposals" />
        </Box>
      </Box>
    </Box>
  );
};

export default ProposalsInsights;
