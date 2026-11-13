import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import StatusBreakdown from '../shared/StatusBreakdown';
import TopicBreakdown from '../shared/TopicBreakdown';
import { MethodSpecificInsightProps } from '../types';

import AiSummary from './AiSummary';
import MostLikedIdeas from './MostLikedIdeas';

const IdeationInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { isPdfRenderMode } = usePdfExportContext();
  const redesigned = useProjectBackofficeRedesign();

  // For PDF export, use single-column layout so content spans full width
  if (isPdfRenderMode) {
    return (
      <Box mt="16px" display="flex" flexDirection="column" gap="24px">
        <AiSummary phaseId={phaseId} participationMethod="ideation" />
        <TopicBreakdown phaseId={phaseId} participationMethod="ideation" />
        <MostLikedIdeas phaseId={phaseId} />
        <StatusBreakdown phaseId={phaseId} participationMethod="ideation" />
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
          <AiSummary phaseId={phaseId} participationMethod="ideation" />
        </Box>
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <TopicBreakdown phaseId={phaseId} participationMethod="ideation" />
        </Box>
      </Box>
      <Box
        display="flex"
        flexWrap={redesigned ? 'wrap' : undefined}
        gap="16px"
        w="100%"
      >
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <MostLikedIdeas phaseId={phaseId} />
        </Box>
        <Box w="100%" flex={redesigned ? '1 1 320px' : undefined} minWidth="0">
          <StatusBreakdown phaseId={phaseId} participationMethod="ideation" />
        </Box>
      </Box>
    </Box>
  );
};

export default IdeationInsights;
