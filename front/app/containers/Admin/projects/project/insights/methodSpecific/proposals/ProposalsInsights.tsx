import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import AiSummary from '../ideation/AiSummary';
import StatusBreakdown from '../shared/StatusBreakdown';
import TopicBreakdown from '../shared/TopicBreakdown';
import { MethodSpecificInsightProps } from '../types';

import MostLikedProposals from './MostLikedProposals';

const ProposalsInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { isPdfRenderMode } = usePdfExportContext();
  const redesigned = useProjectBackofficeRedesign();

  if (isPdfRenderMode) {
    return (
      <Box mt="16px" display="flex" flexDirection="column" gap="24px">
        <AiSummary phaseId={phaseId} participationMethod="proposals" />
        <TopicBreakdown phaseId={phaseId} participationMethod="proposals" />
        <MostLikedProposals phaseId={phaseId} />
        <StatusBreakdown phaseId={phaseId} participationMethod="proposals" />
      </Box>
    );
  }

  return (
    <Box mt="16px" gap="24px">
      <Box
        display="flex"
        flexWrap={redesigned ? 'wrap' : undefined}
        gap="16px"
        w="100%"
      >
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <AiSummary phaseId={phaseId} participationMethod="proposals" />
        </Box>
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <TopicBreakdown phaseId={phaseId} participationMethod="proposals" />
        </Box>
      </Box>
      <Box
        display="flex"
        flexWrap={redesigned ? 'wrap' : undefined}
        gap="16px"
        w="100%"
      >
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <MostLikedProposals phaseId={phaseId} />
        </Box>
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <StatusBreakdown phaseId={phaseId} participationMethod="proposals" />
        </Box>
      </Box>
    </Box>
  );
};

export default ProposalsInsights;
