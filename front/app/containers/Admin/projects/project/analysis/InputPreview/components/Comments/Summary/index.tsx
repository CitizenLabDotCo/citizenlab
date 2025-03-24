import React from 'react';

import {
  Box,
  Divider,
  Text,
  Button,
  Icon,
  Title,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import useAnalysisCommentsSummary from 'api/analysis_comments_summaries/useAnalysisCommentsSummary';
import useGenerateAnalysisCommentsSummary from 'api/analysis_comments_summaries/useGenerateAnalysisCommentsSummary';

import useLocale from 'hooks/useLocale';

import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { timeAgo } from 'utils/dateUtils';

import messages from '../messages';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`;

type Props = {
  analysisId: string;
  inputId: string;
};

const Summary = ({ analysisId, inputId }: Props) => {
  const { data: commentsSummary } = useAnalysisCommentsSummary({
    analysisId,
    inputId,
  });
  const { data: backgroundTask } = useAnalysisBackgroundTask(
    analysisId,
    commentsSummary?.data.relationships.background_task.data.id,
    true
  );
  const locale = useLocale();
  const isGenerating =
    backgroundTask?.data.attributes.state === 'queued' ||
    backgroundTask?.data.attributes.state === 'in_progress';

  const { mutate: generateAnalysis, isLoading: requestingSummary } =
    useGenerateAnalysisCommentsSummary();

  const generatedAt = commentsSummary?.data.attributes.generated_at;
  const missingCommentsCount =
    commentsSummary?.data.attributes.missing_comments_count || 0;

  return (
    <Box mb="24px" position="relative">
      {!commentsSummary && (
        <Button
          buttonStyle="secondary-outlined"
          icon="stars"
          mb="12px"
          onClick={() => generateAnalysis({ analysisId, inputId })}
          size="s"
        >
          <FormattedMessage {...messages.generateSummary} />
        </Button>
      )}

      {commentsSummary && (
        <Box>
          <Box display="flex" gap="4px" alignItems="center" w="fit-content">
            <Title variant="h5" mt="0px" mb="0px">
              <FormattedMessage {...messages.aiSummary} />
            </Title>
            <Icon name="stars" width="16px" />
          </Box>
          <StyledInsightsText>
            {commentsSummary.data.attributes.summary}
          </StyledInsightsText>
          {isGenerating && <Spinner />}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {!isGenerating && (
              <Button
                disabled={requestingSummary}
                buttonStyle="secondary-outlined"
                icon="refresh"
                onClick={() => {
                  generateAnalysis({ analysisId, inputId });
                }}
                processing={requestingSummary}
              >
                <FormattedMessage
                  {...messages.refresh}
                  values={{ count: missingCommentsCount }}
                />
              </Button>
            )}

            <Text m="0px" fontSize="s" textAlign="right" mr="8px">
              {generatedAt && timeAgo(Date.parse(generatedAt), locale)}
            </Text>
          </Box>
          <Divider />
        </Box>
      )}
    </Box>
  );
};

export default Summary;
