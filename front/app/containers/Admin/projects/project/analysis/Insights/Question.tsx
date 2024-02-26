import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { IInsightData } from 'api/analysis_insights/types';

import {
  Box,
  IconButton,
  colors,
  stylingConsts,
  Button,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import styled from 'styled-components';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import Rate from './Rate';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';
import messages from './messages';
import { removeRefs } from './util';
import InsightBody from './InsightBody';
import InsightFooter from './InsightFooter';

const StyledAnswerText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;

type Props = {
  insight: IInsightData;
};

const Question = ({ insight }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatMessage, formatDate } = useIntl();
  const { analysisId, projectId } = useParams() as {
    analysisId: string;
    projectId: string;
  };
  const { mutate: deleteQuestion } = useDeleteAnalysisInsight();
  const { data: question } = useAnalysisQuestion({
    analysisId,
    id: insight.relationships.insightable.data.id,
  });

  const { data: backgroundTask } = useAnalysisBackgroundTask(
    analysisId,
    question?.data.relationships.background_task.data.id
  );
  const processing =
    backgroundTask?.data.attributes.state === 'in_progress' ||
    backgroundTask?.data.attributes.state === 'queued';

  const handleQuestionDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteQuestionConfirmation))) {
      deleteQuestion(
        {
          analysisId,
          id,
        },
        {
          onSuccess: () => {
            trackEventByName(tracks.questionDeleted.name, {
              extra: { analysisId },
            });
          },
        }
      );
    }
  };

  if (!question) return null;
  const hasFilters = !!Object.keys(question.data.attributes.filters).length;

  const phaseId = searchParams.get('phase_id') || undefined;

  const handleRestoreFilters = () => {
    setSearchParams({
      ...(phaseId
        ? {
            phase_id: phaseId,
          }
        : {}),
      reset_filters: 'true',
    });
    const filters = question.data.attributes.filters;
    updateSearchParams(filters);
    if (filters.tag_ids?.length === 1) {
      const element = document.getElementById(`tag-${filters.tag_ids[0]}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const answer = question.data.attributes.answer;

  return (
    <Box
      key={question.data.id}
      bgColor={colors.successLight}
      p="24px"
      pt="48px"
      mb="8px"
      borderRadius={stylingConsts.borderRadius}
      position="relative"
    >
      <Box position="absolute" top="16px" right="8px">
        <IconButton
          iconName={isCopied ? 'check' : 'copy'}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={'Copy summary to clipboard'}
          onClick={() => {
            answer &&
              navigator.clipboard.writeText(
                `${question.data.attributes.question}\n\n${removeRefs(answer)}`
              );
            setIsCopied(true);
          }}
        />
      </Box>
      <Box>
        <InsightBody
          text={answer}
          filters={question.data.attributes.filters}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          backgroundTaskId={question.data.relationships.background_task.data.id}
        />
        <InsightFooter
          filters={question.data.attributes.filters}
          generatedAt={question.data.attributes.created_at}
          analysisId={analysisId}
        />
      </Box>
      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
        mt="16px"
      >
        <Button buttonStyle="white" onClick={handleRestoreFilters} p="4px 12px">
          {formatMessage(messages.restoreFilters)}
        </Button>

        <Box display="flex">
          <IconButton
            iconName="delete"
            onClick={() => handleQuestionDelete(insight.id)}
            iconColor={colors.teal400}
            iconColorOnHover={colors.teal700}
            a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
          />
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="24px"
            iconColor={colors.teal400}
            placement="left-end"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Question;
