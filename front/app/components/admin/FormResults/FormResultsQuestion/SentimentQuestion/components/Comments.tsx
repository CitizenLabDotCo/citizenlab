import React from 'react';

import {
  Box,
  stylingConsts,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Analysis from 'components/admin/FormResults/FormResultsQuestion/TextQuestion/Analysis/';
import AnalysisUpsell from 'components/admin/FormResults/FormResultsQuestion/TextQuestion/AnalysisUpsell';

import TextResponses from '../../TextQuestion/TextResponses';
type TextResponsesProps = {
  customFieldId: string;
  textResponses: {
    answer: string;
  }[];
};

const Comments = ({ customFieldId, textResponses }: TextResponsesProps) => {
  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: project } = useCommunityMonitorProject();

  const projectId = projectIdParam || project?.data.id;
  const phaseId =
    phaseIdParam || project?.data.relationships.current_phase?.data?.id;

  const isTabletOrSmaller = useBreakpoint('tablet');

  const isAnalysisAllowed = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });
  const isAnalysisEnabled = useFeatureFlag({
    name: 'analysis',
  });

  return (
    <Box
      mt="20px"
      display="flex"
      flexDirection={isTabletOrSmaller ? 'column' : 'row'}
      gap="12px"
      width="100%"
      overflowX="auto"
    >
      {/* Text Responses */}
      <Box flexGrow={1}>
        <TextResponses textResponses={textResponses} />
      </Box>

      {/* Summary Box */}
      <Box
        maxWidth={isTabletOrSmaller ? '100%' : '36%'}
        p="16px"
        pt="0px"
        borderRadius={stylingConsts.borderRadius}
        flexShrink={0}
        id="comments-box"
      >
        <Box flex="1">
          {!isAnalysisAllowed && <AnalysisUpsell />}
          {isAnalysisEnabled && (
            <Analysis
              customFieldId={customFieldId}
              textResponsesCount={textResponses.length}
              hasOtherResponses={true}
              projectId={projectId}
              phaseId={phaseId}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Comments;
