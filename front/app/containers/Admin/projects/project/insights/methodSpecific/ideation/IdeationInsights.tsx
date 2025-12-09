import React, { useState, useEffect } from 'react';

import {
  Box,
  Title,
  Text,
  Spinner,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useRegenerateAnalysisSummary from 'api/analysis_summaries/useRegenerateAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';

import useFeatureFlag from 'hooks/useFeatureFlag';

import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import SummaryHeader from 'containers/Admin/projects/project/analysis/Insights/SummaryHeader';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { MethodSpecificInsightProps } from '../types';

import IdeasByTopic from './IdeasByTopic';
import messages from './messages';

const MIN_INPUTS_FOR_SUMMARY = 10;

const IdeationInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);
  const [analysisCreationAttempted, setAnalysisCreationAttempted] =
    useState(false);

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  // Fetch existing analysis for this project (ideation uses project-scoped analysis)
  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses({
    projectId,
  });
  const analysis = analyses?.data[0];
  const analysisId = analysis?.id;

  // Create analysis if needed
  const { mutate: addAnalysis, isLoading: isCreatingAnalysis } =
    useAddAnalysis();

  // Fetch insights (summaries) for the analysis
  const { data: insights, isLoading: isLoadingInsights } = useAnalysisInsights({
    analysisId: analysisId || '',
  });

  // Get the first summary insight
  const summaryInsight = insights?.data.find(
    (insight) => insight.relationships.insightable.data.type === 'summary'
  );
  const summaryId = summaryInsight?.relationships.insightable.data.id;

  // Fetch the full summary data
  const { data: summaryData } = useAnalysisSummary({
    analysisId: analysisId || '',
    id: summaryId || '',
  });

  // Get input count for the analysis
  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId: analysisId || '',
  });
  const inputCount = inputs?.pages[0].meta.filtered_count || 0;

  // Summary generation hooks
  const { mutate: preCheck, isLoading: isPreChecking } =
    useAddAnalysisSummaryPreCheck();
  const { mutate: addSummary, isLoading: isAddingSummary } =
    useAddAnalysisSummary();
  const { mutate: regenerateSummary, isLoading: isRegenerating } =
    useRegenerateAnalysisSummary();

  // Calculate missing inputs count for refresh button
  const missingInputsCount =
    summaryData?.data.attributes.missing_inputs_count || 0;

  // Auto-create analysis if none exists (use projectId for ideation)
  useEffect(() => {
    if (
      analyses &&
      analyses.data.length === 0 &&
      !isCreatingAnalysis &&
      !analysisCreationAttempted
    ) {
      setAnalysisCreationAttempted(true);
      addAnalysis({ projectId });
    }
  }, [
    analyses,
    projectId,
    addAnalysis,
    isCreatingAnalysis,
    analysisCreationAttempted,
  ]);

  // Auto-generate summary if none exists
  useEffect(() => {
    if (
      analysisId &&
      insights?.data.length === 0 &&
      !automaticSummaryCreated &&
      inputCount >= MIN_INPUTS_FOR_SUMMARY
    ) {
      setAutomaticSummaryCreated(true);
      preCheck(
        {
          analysisId,
          filters: {},
        },
        {
          onSuccess: (data) => {
            if (!data.data.attributes.impossible_reason) {
              addSummary({
                analysisId,
                filters: {
                  limit: !largeSummariesAllowed ? 30 : undefined,
                },
              });
            }
          },
        }
      );
    }
  }, [
    analysisId,
    insights,
    automaticSummaryCreated,
    inputCount,
    preCheck,
    addSummary,
    largeSummariesAllowed,
  ]);

  const handleRefresh = () => {
    if (analysisId && summaryId) {
      regenerateSummary({ analysisId, summaryId });
    }
  };

  const handleExplore = () => {
    if (analysisId) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${analysisId}?phase_id=${phaseId}&from=insights`
      );
    }
  };

  // Loading state
  if (isLoadingAnalyses || isLoadingInsights || isCreatingAnalysis) {
    return (
      <Box mt="16px" p="24px" bg="white" borderRadius="3px">
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
          <Text m="0">{formatMessage(messages.loading)}</Text>
        </Box>
      </Box>
    );
  }

  // No analysis or not enough inputs
  if (!analysisId || inputCount < MIN_INPUTS_FOR_SUMMARY) {
    return null;
  }

  // Generating summary
  if (isPreChecking || isAddingSummary) {
    return (
      <Box mt="16px" p="24px" bg="white" borderRadius="3px">
        <Title variant="h3" m="0" mb="16px">
          {formatMessage(messages.whatArePeopleSaying)}
        </Title>
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
          <Text m="0">{formatMessage(messages.generatingSummary)}</Text>
        </Box>
      </Box>
    );
  }

  // No summary generated yet
  if (!summaryData) {
    return null;
  }

  const summary = summaryData.data.attributes.summary;
  const filters = summaryData.data.attributes.filters;
  const backgroundTaskId =
    summaryData.data.relationships.background_task.data.id;

  return (
    <Box mt="16px">
      <Title variant="h3" m="0" mb="16px">
        {formatMessage(messages.whatArePeopleSaying)}
      </Title>
      <Box display="flex" gap="16px">
        {/* AI Summary - Left side (50%) */}
        <Box
          w="50%"
          pt="8px"
          pb="24px"
          px="24px"
          bgColor="rgba(4, 77, 108, 0.05)"
          borderRadius="4px"
          borderLeft={`3px solid ${colors.primary}`}
          display="flex"
          flexDirection="column"
          h="400px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="8px"
            flexShrink={0}
          >
            <SummaryHeader showAiWarning={false} />
            <Button
              buttonStyle="text"
              icon="refresh"
              onClick={handleRefresh}
              processing={isRegenerating}
              padding="0"
            >
              {formatMessage(messages.refresh)}
            </Button>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            gap="8px"
            flex="1"
            overflow="hidden"
          >
            <Box flex="1" overflow="auto">
              <InsightBody
                text={summary}
                filters={filters}
                analysisId={analysisId}
                projectId={projectId}
                phaseId={phaseId}
                backgroundTaskId={backgroundTaskId}
              />
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexShrink={0}
            >
              <Box display="flex" flexDirection="column" gap="4px">
                <Text m="0" fontSize="s" color="textSecondary">
                  {missingInputsCount} / {inputCount}
                </Text>
                <Box display="flex" alignItems="center" gap="4px">
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="50%"
                    bgColor={colors.primary}
                  />
                  <Text m="0" fontSize="s" color="textSecondary">
                    {formatMessage(messages.newResponses, {
                      count: missingInputsCount,
                    })}
                  </Text>
                </Box>
              </Box>

              <Button
                buttonStyle="secondary-outlined"
                icon="eye"
                onClick={handleExplore}
                size="s"
              >
                {formatMessage(messages.explore)}
              </Button>
            </Box>
          </Box>
        </Box>
        <IdeasByTopic phaseId={phaseId} />
      </Box>
    </Box>
  );
};

export default IdeationInsights;
