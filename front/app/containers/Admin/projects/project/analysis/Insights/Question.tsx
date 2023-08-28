import React from 'react';
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
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import FilterItems from '../FilterItems';
import Tag from '../Tags/Tag';
import Rate from './Rate';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSelectedInputId } = useSelectedInputContext();
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const { mutate: deleteQuestion } = useDeleteAnalysisInsight();
  const { data: tags } = useAnalysisTags({ analysisId });

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
      deleteQuestion({
        analysisId,
        id,
      });
    }
  };

  const deleteTrailingIncompleteIDs = (str: string | null) => {
    if (!str) return str;
    return str.replace(/\[?[0-9a-f-]{0,35}$/, '');
  };

  const replaceIdRefsWithLinks = (question) => {
    return reactStringReplace(
      question,
      /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g,
      (match, i) => (
        <StyledButton onClick={() => setSelectedInputId(match)} key={i}>
          <Icon name="idea" />
        </StyledButton>
      )
    );
  };

  if (!question) return null;
  const hasFilters = !!Object.keys(question.data.attributes.filters).length;
  const tagIds = question.data.attributes.filters.tag_ids;

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
    updateSearchParams(question.data.attributes.filters);
  };

  const answer = question.data.attributes.answer;

  return (
    <Box
      key={question.data.id}
      bgColor={colors.successLight}
      p="16px"
      mb="8px"
      borderRadius={stylingConsts.borderRadius}
    >
      <Box p="16px">
        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap="4px"
          mb="12px"
        >
          {hasFilters && (
            <>
              <Box>Question for</Box>
              <FilterItems
                filters={question.data.attributes.filters}
                isEditable={false}
              />
              {tags?.data
                .filter((tag) => tagIds?.includes(tag.id))
                .map((tag) => (
                  <Tag
                    key={tag.id}
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                ))}
            </>
          )}

          {!hasFilters && (
            <>
              <Box>Question for all input</Box>
            </>
          )}
        </Box>
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
          <Box color={colors.teal700}>
            Accuracy {question.data.attributes.accuracy * 100}%
          </Box>
        )}
      </Box>
      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
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
