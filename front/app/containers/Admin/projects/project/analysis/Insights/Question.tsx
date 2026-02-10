import React, { useState } from 'react';

import {
  Box,
  IconButton,
  colors,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearch } from 'utils/router';

import { IInsightData } from 'api/analysis_insights/types';
import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import InsightBody from './InsightBody';
import InsightFooter from './InsightFooter';
import messages from './messages';
import QuestionHeader from './QuestionHeader';
import Rate from './Rate';
import { removeRefs } from './util';

type Props = {
  insight: IInsightData;
};

const Question = ({ insight }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearch({ strict: false });
  const { formatMessage } = useIntl();
  const { analysisId, projectId } = useParams({ strict: false }) as {
    analysisId: string;
    projectId: string;
  };
  const { mutate: deleteQuestion } = useDeleteAnalysisInsight();
  const { data: question } = useAnalysisQuestion({
    analysisId,
    id: insight.relationships.insightable.data.id,
  });

  const fileIds = question?.data.relationships.files?.data.map(
    (file) => file.id
  );

  const handleQuestionDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteQuestionConfirmation))) {
      deleteQuestion(
        {
          analysisId,
          id,
        },
        {
          onSuccess: () => {
            trackEventByName(tracks.questionDeleted, {
              analysisId,
            });
          },
        }
      );
    }
  };

  if (!question) return null;

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
      my="14px"
      position="relative"
      data-cy="e2e-analysis-question"
    >
      <Box display="flex" flexDirection="column" gap="8px">
        <QuestionHeader
          question={question.data.attributes.question}
          showAiWarning={false}
        />
        <InsightBody
          text={answer}
          filters={question.data.attributes.filters}
          fileIds={fileIds}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          backgroundTaskId={question.data.relationships.background_task.data.id}
        />
        <InsightFooter
          filters={question.data.attributes.filters}
          generatedAt={question.data.attributes.created_at}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          customFieldIds={question.data.attributes.custom_field_ids}
        />
        <Box
          display="flex"
          gap="16px"
          alignItems="center"
          justifyContent="flex-end"
        >
          <IconButton
            iconName="filter-2"
            onClick={handleRestoreFilters}
            iconColor={colors.textPrimary}
            iconColorOnHover={colors.textSecondary}
            iconWidth="20px"
            iconHeight="20px"
            a11y_buttonActionMessage={formatMessage(messages.restoreFilters)}
            p="0"
          />
          <IconButton
            iconName={isCopied ? 'check' : 'copy'}
            iconColor={colors.textPrimary}
            iconColorOnHover={colors.textSecondary}
            iconWidth="20px"
            iconHeight="20px"
            a11y_buttonActionMessage={'Copy summary to clipboard'}
            p="0"
            onClick={() => {
              answer &&
                navigator.clipboard.writeText(
                  `${question.data.attributes.question}\n\n${removeRefs(
                    answer
                  )}`
                );
              setIsCopied(true);
            }}
          />
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="20px"
            iconColor={colors.textPrimary}
            placement="top"
          />
          <IconButton
            iconName="delete"
            onClick={() => handleQuestionDelete(insight.id)}
            iconColor={colors.textPrimary}
            iconColorOnHover={colors.textSecondary}
            iconWidth="20px"
            iconHeight="20px"
            a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
            p="0"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Question;
