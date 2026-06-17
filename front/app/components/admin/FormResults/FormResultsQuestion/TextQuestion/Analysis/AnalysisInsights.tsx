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
import { IInsights } from 'api/analysis_insights/types';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { useSearch } from 'utils/router';

import messages from '../../../messages';
import { TextResponseSource } from '../utils';

import Question from './Question';
import Summary from './Summary';
import { getPublishedAtFromFilter, getPublishedAtToFilter } from './utils';

const AnalysisInsights = ({
  analysis,
  textResponseSource,
  textResponsesCount,
  insights,
}: {
  analysis: IAnalysisData;
  textResponseSource?: TextResponseSource;
  textResponsesCount: number;
  insights?: IInsights;
}) => {
  const search = useSearch({ strict: false });
  const [automaticSummaryCreated, setAutomaticSummaryCreated] = useState(false);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState(0);

  const { formatMessage } = useIntl();

  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId: analysis.id,
  });

  const { mutate: addAnalysisSummary, isLoading: addSummaryIsLoading } =
    useAddAnalysisSummary();
  const { mutate: preCheck, isLoading: preCheckIsLoading } =
    useAddAnalysisSummaryPreCheck();

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  const inputCount = inputs?.pages[0].meta.filtered_count || 0;
  const selectedInsight = insights?.data[selectedInsightIndex];

  // Auto-generate only when there are enough responses to summarise. For the
  // "other" box that means >10 'other' responses specifically (textResponsesCount),
  // not all responders to the question (inputCount).
  const enoughResponses =
    textResponseSource === 'other_option'
      ? textResponsesCount > 10
      : inputCount > 10;

  // Create a summary if there are no (qualifying) insights yet
  useEffect(() => {
    if (
      analysis.id &&
      insights?.data.length === 0 &&
      !automaticSummaryCreated &&
      enoughResponses
    ) {
      setAutomaticSummaryCreated(true);
      preCheck(
        {
          analysisId: analysis.id,
          filters: {
            input_custom_field_no_empty_values: true,
            published_at_from: getPublishedAtFromFilter(
              search.year,
              search.quarter
            ),
            published_at_to: getPublishedAtToFilter(
              search.year,
              search.quarter
            ),
          },
        },
        {
          onSuccess: (data) => {
            const customFieldId =
              analysis.relationships.main_custom_field?.data?.id;

            if (!data.data.attributes.impossible_reason) {
              const filters = {
                input_custom_field_no_empty_values: true,
                published_at_from: getPublishedAtFromFilter(
                  search.year,
                  search.quarter
                ),
                published_at_to: getPublishedAtToFilter(
                  search.year,
                  search.quarter
                ),
                limit: !largeSummariesAllowed ? 30 : undefined,
              };
              if (textResponseSource === 'other_option' && customFieldId) {
                filters[`input_custom_${customFieldId}`] = ['other'];
              }
              addAnalysisSummary({
                analysisId: analysis.id,
                filters,
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
    enoughResponses,
    largeSummariesAllowed,
    preCheck,
    textResponseSource,
    analysis.relationships.main_custom_field?.data?.id,
    search,
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
