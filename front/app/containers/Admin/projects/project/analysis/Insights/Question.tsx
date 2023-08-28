import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import reactStringReplace from 'react-string-replace';

import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import { IInsightData } from 'api/analysis_insights/types';

import {
  Box,
  Icon,
  IconButton,
  Spinner,
  colors,
  stylingConsts,
  Text,
  Button,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import { useSelectedInputContext } from '../SelectedInputContext';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import FilterItems from '../FilterItems';
import Rate from './Rate';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

const StyledAnswerText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledButton = styled.button`
  padding: 0px;
  cursor: pointer;
`;

type Props = {
  insight: IInsightData;
};

const Question = ({ insight }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedInputId } = useSelectedInputContext();
  const { formatMessage, formatDate } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
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

  const deleteTrailingIncompleteIDs = (str: string | null) => {
    if (!str) return str;
    return str.replace(/\[?[0-9a-f-]{0,35}$/, '');
  };

  const refRegex =
    /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g;

  const refRegexWithInitialEmptySpace =
    /\s\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g;

  const removeRefs = (summary: string) => {
    return summary.replace(refRegexWithInitialEmptySpace, '');
  };

  const handleClickInput = (inputId: string) => {
    setSelectedInputId(inputId);
    const element = document.getElementById(`input-${inputId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const replaceIdRefsWithLinks = (question) => {
    return reactStringReplace(question, refRegex, (match, i) => (
      <StyledButton
        onClick={() => {
          handleClickInput(match);
          trackEventByName(tracks.inputPreviewedFromQuestion.name, {
            extra: { analysisId },
          });
        }}
        key={i}
      >
        <Icon name="idea" />
      </StyledButton>
    ));
  };

  if (!question) return null;
  const hasFilters = !!Object.keys(question.data.attributes.filters).length;

  const phaseId = searchParams.get('phase_id');

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
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap="4px"
          mb="12px"
        >
          {hasFilters && (
            <>
              <Text m="0px">Question for</Text>
              <FilterItems
                filters={question.data.attributes.filters}
                isEditable={false}
              />
            </>
          )}

          {!hasFilters && <Text m="0px">Question for all input</Text>}
        </Box>

        <Text color="textSecondary" fontSize="s">
          {formatDate(question.data.attributes.created_at)}
        </Text>

        <Text fontWeight="bold">{question.data.attributes.question}</Text>
        <Box>
          <StyledAnswerText>
            {replaceIdRefsWithLinks(
              processing ? deleteTrailingIncompleteIDs(answer) : answer
            )}
          </StyledAnswerText>
          {processing && <Spinner />}
        </Box>
        {question.data.attributes.accuracy && (
          <Box color={colors.teal700} my="16px">
            Accuracy {question.data.attributes.accuracy * 100}%
          </Box>
        )}
      </Box>
      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
        mt="16px"
      >
        <Button buttonStyle="white" onClick={handleRestoreFilters} p="4px 12px">
          Restore filters
        </Button>

        <Box display="flex">
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="24px"
            iconColor={colors.teal400}
            placement="left-end"
          />
          <IconButton
            iconName="delete"
            onClick={() => handleQuestionDelete(insight.id)}
            iconColor={colors.teal400}
            iconColorOnHover={colors.teal700}
            a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Question;
