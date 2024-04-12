import React, { useState, useEffect } from 'react';

import {
  Box,
  IconButton,
  colors,
  Text,
  Spinner,
} from '@citizenlab/cl2-component-library';

import { IAnalysisData } from 'api/analyses/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

import Question from './Question';
import Summary from './Summary';

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
  const { mutate: addAnalysisSummary, isLoading: addSummaryIsLoading } =
    useAddAnalysisSummary();
  const { mutate: preCheck, isLoading: preCheckIsLoading } =
    useAddAnalysisSummaryPreCheck();

  const largeSummariesEnabled = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

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
      preCheck(
        {
          analysisId: analysis.id,
          filters: {
            input_custom_field_no_empty_values: true,
          },
        },
        {
          onSuccess: (data) => {
            if (!data.data.attributes.impossible_reason) {
              addAnalysisSummary({
                analysisId: analysis.id,
                filters: {
                  input_custom_field_no_empty_values: true,
                  limit: !largeSummariesEnabled ? 30 : undefined,
                },
              });
            }
          },
        }
      );
    }
  }, [
    analysis.id,
    addAnalysisSummary,
    insights,
    automaticSummaryCreated,
    inputCount,
    largeSummariesEnabled,
    preCheck,
  ]);

  if (addSummaryIsLoading || preCheckIsLoading) {
    return <Spinner />;
  }

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
