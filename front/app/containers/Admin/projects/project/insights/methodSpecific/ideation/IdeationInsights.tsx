import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import StatusBreakdown from '../shared/StatusBreakdown';
import TopicBreakdown from '../shared/TopicBreakdown';
import { MethodSpecificInsightProps } from '../types';

import AiSummary from './AiSummary';
import MostLikedIdeas from './MostLikedIdeas';

const IdeationInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { isPdfRenderMode } = usePdfExportContext();

  // For PDF export, use single-column layout so content spans full width
  if (isPdfRenderMode) {
    return (
      <Box mt="16px" display="flex" flexDirection="column" gap="24px">
        <AiSummary phaseId={phaseId} />
        <TopicBreakdown phaseId={phaseId} />
        <MostLikedIdeas phaseId={phaseId} />
        <StatusBreakdown phaseId={phaseId} participationMethod="ideation" />
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
          <MostLikedIdeas phaseId={phaseId} />
        </Box>
        <Box w="100%">
          <StatusBreakdown phaseId={phaseId} participationMethod="ideation" />
        </Box>
      </Box>
    </Box>
  );
};

export default IdeationInsights;
