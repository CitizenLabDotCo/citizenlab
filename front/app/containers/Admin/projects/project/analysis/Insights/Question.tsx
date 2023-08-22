import React from 'react';
import { useParams } from 'react-router-dom';
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
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import { useSelectedInputContext } from '../SelectedInputContext';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';

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
  const { setSelectedInputId } = useSelectedInputContext();
  const { formatMessage } = useIntl();
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
      deleteQuestion({
        analysisId,
        id,
      });
    }
  };

  const replaceIdRefsWithLinks = (question) => {
    return reactStringReplace(
      question,
      /\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})\]?/g,
      (match, i) => (
        <StyledButton onClick={() => setSelectedInputId(match)} key={i}>
          <Icon name="search" />
        </StyledButton>
      )
    );
  };

  if (!question) return null;
  const hasFilters = !!Object.keys(question.data.attributes.filters).length;

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
              {Object.entries(question.data.attributes.filters).map(
                ([k, v]) => (
                  <Box
                    key={k}
                    bgColor={colors.teal200}
                    color={colors.teal700}
                    py="2px"
                    px="4px"
                    borderRadius={stylingConsts.borderRadius}
                  >
                    {k}: {v}
                  </Box>
                )
              )}
            </>
          )}

          {!hasFilters && (
            <>
              <Box>Question</Box>
            </>
          )}
        </Box>
        <Text fontWeight="bold">{question.data.attributes.question}</Text>
        <Box>
          <StyledAnswerText>
            {replaceIdRefsWithLinks(question.data.attributes.answer)}
          </StyledAnswerText>
          {processing && <Spinner />}
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="row-reverse"
        gap="4px"
        alignItems="center"
      >
        <IconButton
          iconName="delete"
          onClick={() => handleQuestionDelete(insight.id)}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={formatMessage(messages.deleteQuestion)}
        />
        {question.data.attributes.accuracy && (
          <Box color={colors.teal700}>
            Accuracy {question.data.attributes.accuracy * 100}%
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Question;
