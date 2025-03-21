import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Analysis from 'components/admin/FormResults/FormResultsQuestion/TextQuestion/Analysis/';
import AnalysisUpsell from 'components/admin/FormResults/FormResultsQuestion/TextQuestion/AnalysisUpsell';

import { useIntl } from 'utils/cl-intl';

import TextResponses from '../../TextQuestion/TextResponses';
import messages from '../messages';

type CommentsProps = {
  customFieldId: string;
  showAnalysis?: boolean;
  textResponses: {
    answer: string;
  }[];
};

const Comments = ({
  customFieldId,
  showAnalysis = true,
  textResponses,
}: CommentsProps) => {
  const { formatMessage } = useIntl();
  const isTabletOrSmaller = useBreakpoint('tablet');

  // Get the relevant project and phase id from the URL
  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  // If no URL params are provided, fetch the community monitor project
  const { data: project } = useCommunityMonitorProject({
    enabled: !phaseIdParam && !projectIdParam,
  });

  const projectId = projectIdParam || project?.data.id;
  const phaseId =
    phaseIdParam || project?.data.relationships.current_phase?.data?.id;

  // Check if AI analysis allowed and enabled
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
    >
      {textResponses.length > 0 ? (
        <>
          {/* Follow Up Text Responses */}
          <Box flexGrow={1}>
            <TextResponses textResponses={textResponses} />
          </Box>

          {/* AI Summary */}
          <Box maxWidth={isTabletOrSmaller ? '100%' : '38%'} p="8px" pt="0px">
            <Box flex="1">
              {!isAnalysisAllowed && <AnalysisUpsell />}
              {isAnalysisEnabled && showAnalysis && (
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
        </>
      ) : (
        <Text m="0px" ml="12px" color="textSecondary">
          {formatMessage(messages.noFollowUpResponses)}
        </Text>
      )}
    </Box>
  );
};

export default Comments;
