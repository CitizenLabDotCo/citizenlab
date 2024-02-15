import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  colors,
  Text,
  Icon,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { IAnalysisData } from 'api/analyses/types';
import useAnalysisQuestion from 'api/analysis_questions/useAnalysisQuestion';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useRegenerateAnalysisSummary from 'api/analysis_summaries/useRegenerateAnalysisSummary';
import useRegenerateAnalysisQuestion from 'api/analysis_questions/useRegenerateAnalysisQuestion';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../messages';
import {
  deleteTrailingIncompleteIDs,
  replaceIdRefsWithLinks,
} from 'containers/Admin/projects/project/analysis/Insights/util';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const StyledInsightsText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`;

import Button from 'components/UI/Button';
import { stringify } from 'qs';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import FilterItems from 'containers/Admin/projects/project/analysis/FilterItems';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAnalysisBackgroundTask from 'api/analysis_background_tasks/useAnalysisBackgroundTask';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';

// Convert all values in the filters object to strings
// This is necessary because the filters are passed as query params
const convertFilterValuesToString = (filters?: IInputsFilterParams) => {
  return (
    filters &&
    Object.entries(filters).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: JSON.stringify(value),
      };
    }, {})
  );
};

const Summary = ({
  summaryId,
  analysisId,
}: {
  summaryId: string;
  analysisId: string;
}) => {
  const { formatMessage, formatDate } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data } = useAnalysisSummary({ analysisId, id: summaryId });
  const { data: task } = useAnalysisBackgroundTask(
    analysisId,
    data?.data.relationships.background_task.data.id,
    true
  );

  const { mutate: regenerateSummary, isLoading: isLoadingRegenerateSummary } =
    useRegenerateAnalysisSummary();
  const summary = data?.data.attributes.summary;
  const filters = data?.data.attributes.filters;
  const accuracy = data?.data.attributes.accuracy;
  const generatedAt = data?.data.attributes.created_at;
  const missingInputsCount = data?.data.attributes.missing_inputs_count;

  const isLoading =
    task?.data.attributes.state === 'queued' ||
    task?.data.attributes.state === 'in_progress';

  if (!summary) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="460px"
      gap="16px"
    >
      <Box overflowY="auto" h="100%">
        {filters && (
          <FilterItems
            filters={filters}
            isEditable={false}
            analysisId={analysisId}
          />
        )}
        <Text fontWeight="bold">
          {formatMessage(messages.aiSummary)} <Icon name="flash" />
        </Text>
        <StyledInsightsText mt="0px">
          {replaceIdRefsWithLinks({
            insight: isLoading ? deleteTrailingIncompleteIDs(summary) : summary,
            analysisId,
            projectId,
            phaseId,
          })}
        </StyledInsightsText>
        {isLoading && <Spinner />}
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        <Text m="0px" fontSize="s">
          <FormattedMessage
            {...messages.accuracy}
            values={{
              accuracy: accuracy ? accuracy * 100 : 0,
              percentage: formatMessage(messages.percentage),
            }}
          />
        </Text>

        <Text m="0px" fontSize="s">
          {formatMessage(messages.generated)} {formatDate(generatedAt)}
        </Text>
      </Box>
      <Box display="flex" gap="16px">
        <Button
          disabled={missingInputsCount === 0}
          buttonStyle="secondary-outlined"
          icon="refresh"
          onClick={() => {
            regenerateSummary({ analysisId, summaryId });
          }}
          processing={isLoadingRegenerateSummary}
        >
          <FormattedMessage
            {...messages.refresh}
            values={{ count: missingInputsCount }}
          />
        </Button>
        <Button
          buttonStyle="secondary"
          icon="eye"
          linkTo={`/admin/projects/${projectId}/analysis/${analysisId}?${stringify(
            { ...convertFilterValuesToString(filters), phase_id: phaseId }
          )}`}
        >
          {formatMessage(messages.explore)}
        </Button>
      </Box>
    </Box>
  );
};

const Question = ({
  questionId,
  analysisId,
}: {
  questionId: string;
  analysisId: string;
}) => {
  const { formatMessage, formatDate } = useIntl();
  const { data } = useAnalysisQuestion({ analysisId, id: questionId });
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: task } = useAnalysisBackgroundTask(
    analysisId,
    data?.data.relationships.background_task.data.id,
    true
  );

  const { mutate: regenerateQuestion, isLoading: isLoadingRegenerateQuestion } =
    useRegenerateAnalysisQuestion();

  const question = data?.data.attributes.question;
  const answer = data?.data.attributes.answer;
  const filters = data?.data.attributes.filters;
  const accuracy = data?.data.attributes.accuracy;
  const generatedAt = data?.data.attributes.created_at;
  const missingInputsCount = data?.data.attributes.missing_inputs_count;

  const isLoading =
    task?.data.attributes.state === 'queued' ||
    task?.data.attributes.state === 'in_progress';
  if (!question || !answer) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="460px"
      gap="16px"
    >
      <Box overflowY="auto" h="100%">
        {filters && (
          <FilterItems
            filters={filters}
            isEditable={false}
            analysisId={analysisId}
          />
        )}
        <Text fontWeight="bold">
          {question} <Icon name="question-bubble" />
        </Text>
        <StyledInsightsText mt="0px">
          {replaceIdRefsWithLinks({
            insight: isLoading ? deleteTrailingIncompleteIDs(answer) : answer,
            analysisId,
            projectId,
            phaseId,
          })}
        </StyledInsightsText>
        {isLoading && <Spinner />}
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        <Text m="0px" fontSize="s">
          <FormattedMessage
            {...messages.accuracy}
            values={{
              accuracy: accuracy ? accuracy * 100 : 0,
              percentage: formatMessage(messages.percentage),
            }}
          />
        </Text>

        <Text m="0px" fontSize="s">
          {formatMessage(messages.generated)} {formatDate(generatedAt)}
        </Text>
      </Box>
      <Box display="flex" gap="16px">
        <Button
          disabled={missingInputsCount === 0}
          buttonStyle="secondary-outlined"
          icon="refresh"
          onClick={() => {
            regenerateQuestion({ analysisId, questionId });
          }}
          processing={isLoadingRegenerateQuestion}
        >
          <FormattedMessage
            {...messages.refresh}
            values={{ count: missingInputsCount }}
          />
        </Button>
        <Button
          buttonStyle="secondary"
          icon="eye"
          linkTo={`/admin/projects/${projectId}/analysis/${analysisId}?${stringify(
            { ...convertFilterValuesToString(filters), phase_id: phaseId }
          )}`}
        >
          {formatMessage(messages.explore)}
        </Button>
      </Box>
    </Box>
  );
};

const AnalysisInsights = ({ analysis }: { analysis: IAnalysisData }) => {
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);

  const { formatMessage } = useIntl();

  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId: analysis.id,
  });
  const { data: insights } = useAnalysisInsights({
    analysisId: analysis.id,
  });
  const { mutate: addAnalysisSummary } = useAddAnalysisSummary();

  const inputCount = inputs?.pages[0].meta.filtered_count || 0;
  const selectedInsight = insights?.data[selectedInsightIndex];

  // Create a summary if there are no insights yet

  useEffect(() => {
    if (
      analysis.id &&
      insights?.data.length === 0 &&
      !automaticSummaryCreated &&
      inputCount > 10
    ) {
      setAutomaticSummaryCreated(true);
      addAnalysisSummary({
        analysisId: analysis.id,
        filters: {
          input_custom_field_no_empty_values: true,
          limit: 30,
        },
      });
    }
  }, [
    analysis.id,
    addAnalysisSummary,
    insights,
    automaticSummaryCreated,
    inputCount,
  ]);

  if (!insights || insights.data.length === 0) {
    return null;
  }

  return (
    <Box position="relative">
      {insights.data.length > 1 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="100%"
          mb="20px"
          position="absolute"
          top="-50px"
        >
          <IconButton
            iconName="chevron-left"
            onClick={() => {
              selectedInsightIndex > 0 &&
                setSelectedInsightIndex(selectedInsightIndex - 1);
            }}
            iconColor={colors.black}
            iconColorOnHover={colors.black}
            a11y_buttonActionMessage={formatMessage(messages.previousInsight)}
          />
          <Text>
            {selectedInsightIndex + 1} / {insights.data.length}
          </Text>
          <IconButton
            iconName="chevron-right"
            onClick={() => {
              selectedInsightIndex < insights.data.length - 1 &&
                setSelectedInsightIndex(selectedInsightIndex + 1);
            }}
            iconColor={colors.black}
            iconColorOnHover={colors.black}
            a11y_buttonActionMessage={formatMessage(messages.nextInsight)}
          />
        </Box>
      )}
      <Box>
        {selectedInsight && (
          <>
            {selectedInsight.relationships.insightable.data.type ===
            'analysis_question' ? (
              <Question
                key={selectedInsight.relationships.insightable.data.id}
                questionId={selectedInsight.relationships.insightable.data.id}
                analysisId={analysis.id}
              />
            ) : (
              <Summary
                key={selectedInsight.relationships.insightable.data.id}
                summaryId={selectedInsight.relationships.insightable.data.id}
                analysisId={analysis.id}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AnalysisInsights;
