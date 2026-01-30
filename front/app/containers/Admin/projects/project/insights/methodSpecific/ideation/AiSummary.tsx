import React, { useState, useEffect } from 'react';

import {
  Box,
  Text,
  Spinner,
  Button,
  colors,
  Title,
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
import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { getAnalysisScope } from 'containers/Admin/projects/components/AnalysisBanner/utils';
import InsightBody from 'containers/Admin/projects/project/analysis/Insights/InsightBody';
import SummaryHeader from 'containers/Admin/projects/project/analysis/Insights/SummaryHeader';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { usePdfExportContext } from '../../pdf/PdfExportContext';

import messages from './messages';

const MIN_INPUTS_FOR_SUMMARY = 10;

interface Props {
  phaseId: string;
  participationMethod: ParticipationMethod;
}

const AiSummary = ({ phaseId, participationMethod }: Props) => {
  const { formatMessage } = useIntl();
  const { isPdfRenderMode } = usePdfExportContext();
  const { projectId } = useParams() as { projectId: string };
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);
  const [analysisCreationAttempted, setAnalysisCreationAttempted] =
    useState(false);

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  // Determine the correct scope based on participation method
  const scope = getAnalysisScope(participationMethod);

  // Query analyses with correct scope (projectId for ideation/voting, phaseId for others)
  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses(
    scope === 'project' ? { projectId } : { phaseId }
  );
  const analysis = analyses?.data[0];
  const analysisId = analysis?.id;

  const { mutate: addAnalysis, isLoading: isCreatingAnalysis } =
    useAddAnalysis();

  const { data: insights, isLoading: isLoadingInsights } = useAnalysisInsights({
    analysisId: analysisId || '',
  });

  const summaryInsight = insights?.data.find(
    (insight) => insight.relationships.insightable.data.type === 'summary'
  );
  const summaryId = summaryInsight?.relationships.insightable.data.id;

  const { data: summaryData } = useAnalysisSummary({
    analysisId: analysisId || '',
    id: summaryId || '',
  });

  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId: analysisId || '',
  });
  const inputCount = inputs?.pages[0].meta.filtered_count || 0;

  const { mutate: preCheck, isLoading: isPreChecking } =
    useAddAnalysisSummaryPreCheck();
  const { mutate: addSummary, isLoading: isAddingSummary } =
    useAddAnalysisSummary();
  const { mutate: regenerateSummary, isLoading: isRegenerating } =
    useRegenerateAnalysisSummary();

  const missingInputsCount =
    summaryData?.data.attributes.missing_inputs_count || 0;

  useEffect(() => {
    if (
      analyses &&
      analyses.data.length === 0 &&
      !isCreatingAnalysis &&
      !analysisCreationAttempted
    ) {
      setAnalysisCreationAttempted(true);
      // Create analysis with correct scope (projectId for ideation/voting, phaseId for others)
      addAnalysis(scope === 'project' ? { projectId } : { phaseId });
    }
  }, [
    analyses,
    projectId,
    phaseId,
    scope,
    addAnalysis,
    isCreatingAnalysis,
    analysisCreationAttempted,
  ]);

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

  if (isLoadingAnalyses || isLoadingInsights || isCreatingAnalysis) {
    return (
      <Box p="24px" bg="white" borderRadius="3px">
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
          <Text m="0">{formatMessage(messages.loading)}</Text>
        </Box>
      </Box>
    );
  }

  if (inputCount < MIN_INPUTS_FOR_SUMMARY) {
    return (
      <Box
        pt="8px"
        pb="24px"
        px="24px"
        bgColor="rgba(4, 77, 108, 0.05)"
        borderRadius="4px"
        borderLeft={`3px solid ${colors.primary}`}
        display="flex"
        flexDirection="column"
      >
        <Title variant="h3" m="0" mb="16px">
          {formatMessage(messages.whatArePeopleSaying)}
        </Title>
        <Box
          p="24px"
          bgColor="white"
          borderRadius="8px"
          boxShadow="0px 1px 2px 0px rgba(0,0,0,0.05)"
        >
          <Text m="0" color="textSecondary">
            {formatMessage(messages.notEnoughInputs, {
              minInputs: MIN_INPUTS_FOR_SUMMARY,
              count: inputCount,
            })}
          </Text>
        </Box>
      </Box>
    );
  }

  if (isPreChecking || isAddingSummary) {
    return (
      <Box p="24px" bg="white" borderRadius="3px">
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
          <Text m="0">{formatMessage(messages.generatingSummary)}</Text>
        </Box>
      </Box>
    );
  }

  if (!summaryData || !analysisId) {
    return null;
  }

  const summary = summaryData.data.attributes.summary;
  const filters = summaryData.data.attributes.filters;
  const backgroundTaskId =
    summaryData.data.relationships.background_task.data.id;

  return (
    <Box>
      <Title variant="h3" m="0" mb="16px">
        {formatMessage(messages.whatArePeopleSaying)}
      </Title>
      <Box
        pt="8px"
        pb="24px"
        px="24px"
        bgColor="rgba(4, 77, 108, 0.05)"
        borderRadius="4px"
        borderLeft={`3px solid ${colors.primary}`}
        display="flex"
        flexDirection="column"
        h={isPdfRenderMode ? 'auto' : '400px'}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="8px"
          flexShrink={0}
        >
          <SummaryHeader showAiWarning={false} />
          {!isPdfRenderMode && (
            <Button
              buttonStyle="text"
              icon="refresh"
              onClick={handleRefresh}
              processing={isRegenerating}
              padding="0"
            >
              {formatMessage(messages.refresh)}
            </Button>
          )}
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          gap="8px"
          flex="1"
          overflow={isPdfRenderMode ? 'visible' : 'hidden'}
        >
          <Box flex="1" overflow={isPdfRenderMode ? 'visible' : 'auto'}>
            <InsightBody
              text={summary}
              filters={filters}
              analysisId={analysisId}
              projectId={projectId}
              phaseId={phaseId}
              backgroundTaskId={backgroundTaskId}
            />
          </Box>

          {!isPdfRenderMode && (
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
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AiSummary;
