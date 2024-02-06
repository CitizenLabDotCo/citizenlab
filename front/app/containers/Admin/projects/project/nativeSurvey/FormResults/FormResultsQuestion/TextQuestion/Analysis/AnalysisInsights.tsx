import {
  Box,
  IconButton,
  colors,
  Text,
  Icon,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { IAnalysisData } from 'api/analyses/types';
import useAnalysisInsightsWithIds from 'api/analysis_insights/useAnalysisInsightsById';
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

type AnalysisInsight = {
  analysisId: string;
  relationship: {
    id: string;
    type: 'summary' | 'analysis_question';
  };
};

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

const AnalysisInsights = ({ analyses }: { analyses: IAnalysisData[] }) => {
  const [backgroundTaskId, setBackgroundTaskId] = useState<
    string | undefined
  >();
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);

  const singleCustomFieldAnalysisId = analyses.find(
    (analysis) => analysis.relationships.custom_fields.data.length === 1
  )?.id;

  const { data: singleCustomFieldAnalysisInsights } = useAnalysisInsights({
    analysisId: singleCustomFieldAnalysisId,
  });

  const { mutate: addAnalysisSummary } = useAddAnalysisSummary();

  const { data: task } = useAnalysisBackgroundTask(
    singleCustomFieldAnalysisId,
    backgroundTaskId,
    true
  );
  const { formatMessage } = useIntl();
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);
  const result = useAnalysisInsightsWithIds({
    analysisIds: analyses?.map((a) => a.id) || [],
  });

  const insights = result
    .flatMap(({ data }, i) =>
      data?.data.map((insight) => ({
        analysisId: analyses[i].id,
        relationship: insight.relationships.insightable.data,
      }))
    )
    .filter((relationship) => relationship !== undefined) as AnalysisInsight[];

  const selectedInsight = insights[selectedInsightIndex];

  // Create a summary if there are no insights yet

  useEffect(() => {
    if (
      singleCustomFieldAnalysisId &&
      singleCustomFieldAnalysisInsights?.data.length === 0 &&
      !automaticSummaryCreated
    ) {
      setAutomaticSummaryCreated(true);
      addAnalysisSummary(
        {
          analysisId: singleCustomFieldAnalysisId,
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
    singleCustomFieldAnalysisId,
    addAnalysisSummary,
    singleCustomFieldAnalysisInsights,
    automaticSummaryCreated,
  ]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Box position="relative">
      {insights.length > 1 && (
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
            {selectedInsightIndex + 1} / {insights.length}
          </Text>
          <IconButton
            iconName="chevron-right"
            onClick={() => {
              selectedInsightIndex < insights.length - 1 &&
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
            {selectedInsight.relationship.type === 'analysis_question' ? (
              <Question
                key={selectedInsight.relationship.id}
                summaryId={selectedInsight.relationship.id}
                analysisId={selectedInsight.analysisId}
                isLoading={
                  task?.data.attributes.state === 'queued' ||
                  task?.data.attributes.state === 'in_progress'
                }
              />
            ) : (
              <Summary
                key={selectedInsight.relationship.id}
                summaryId={selectedInsight.relationship.id}
                analysisId={selectedInsight.analysisId}
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
