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
import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../messages';
import { replaceIdRefsWithLinks } from '../../../../../analysis/Insights/util';
import { useParams } from 'react-router-dom';

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
  isLoading,
}: {
  summaryId: string;
  analysisId: string;
  isLoading?: boolean;
}) => {
  const { formatMessage, formatDate } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data } = useAnalysisSummary({ analysisId, id: summaryId });

  const summary = data?.data.attributes.summary;
  const filters = data?.data.attributes.filters;
  const accuracy = data?.data.attributes.accuracy;
  const generatedAt = data?.data.attributes.created_at;

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
        <Text>
          {replaceIdRefsWithLinks({
            insight: summary,
            analysisId,
            projectId,
            phaseId,
          })}
        </Text>
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
      <Box display="flex">
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
  summaryId,
  analysisId,
  isLoading,
}: {
  summaryId: string;
  analysisId: string;
  isLoading?: boolean;
}) => {
  const { formatMessage, formatDate } = useIntl();
  const { data } = useAnalysisQuestion({ analysisId, id: summaryId });
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const question = data?.data.attributes.question;
  const answer = data?.data.attributes.answer;
  const filters = data?.data.attributes.filters;
  const accuracy = data?.data.attributes.accuracy;
  const generatedAt = data?.data.attributes.created_at;

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
        <Text mt="0px">
          {replaceIdRefsWithLinks({
            insight: answer,
            analysisId,
            projectId,
            phaseId,
          })}
        </Text>
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
      <Box display="flex">
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
  const [backgroundTaskId, setBackgroundTaskId] = useState<
    string | undefined
  >();
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);

  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId: analysis.id,
    queryParams: {},
  });

  const inputCount = inputs?.pages[0].meta.filtered_count || 0;
  const { data: singleCustomFieldAnalysisInsights } = useAnalysisInsights({
    analysisId: analysis.id,
  });

  const { mutate: addAnalysisSummary } = useAddAnalysisSummary();

  const { data: task } = useAnalysisBackgroundTask(
    analysis.id,
    backgroundTaskId,
    true
  );
  const { formatMessage } = useIntl();
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);
  const { data: insights } = useAnalysisInsights({
    analysisId: analysis.id,
  });

  const selectedInsight = insights?.data[selectedInsightIndex];

  // Create a summary if there are no insights yet

  useEffect(() => {
    if (
      analysis.id &&
      singleCustomFieldAnalysisInsights?.data.length === 0 &&
      !automaticSummaryCreated &&
      inputCount > 10
    ) {
      setAutomaticSummaryCreated(true);
      addAnalysisSummary(
        {
          analysisId: analysis.id,
          filters: {},
        },
        {
          onSuccess: (res) => {
            setBackgroundTaskId(res.data.relationships.background_task.data.id);
          },
        }
      );
    }
  }, [
    analysis.id,
    addAnalysisSummary,
    singleCustomFieldAnalysisInsights,
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
                summaryId={selectedInsight.relationships.insightable.data.id}
                analysisId={analysis.id}
                isLoading={
                  task?.data.attributes.state === 'queued' ||
                  task?.data.attributes.state === 'in_progress'
                }
              />
            ) : (
              <Summary
                key={selectedInsight.relationships.insightable.data.id}
                summaryId={selectedInsight.relationships.insightable.data.id}
                analysisId={analysis.id}
                isLoading={
                  task?.data.attributes.state === 'queued' ||
                  task?.data.attributes.state === 'in_progress'
                }
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AnalysisInsights;
