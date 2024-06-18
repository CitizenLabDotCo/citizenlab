import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';
import Question from './Question';
import QuestionButton from './QuestionButton';
import QuestionInput from './QuestionInput';
import SummarizeButton from './SummarizeButton';
import Summary from './Summary';

const Insights = () => {
  const { formatMessage } = useIntl();
  const [isQuestionInputOpen, setIsQuestionInputOpen] = useState(false);
  const { analysisId } = useParams() as { analysisId: string };
  const { data: insights, isLoading } = useAnalysisInsights({
    analysisId,
  });

  const largeSummariesEnabled = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  const filters = useAnalysisFilterParams();

  const { data: allInputs } = useInfiniteAnalysisInputs({
    analysisId,
  });
  const { data: filteredInputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputsCount = allInputs?.pages[0].meta.filtered_count || 0;
  const filteredInputsCount = filteredInputs?.pages[0].meta.filtered_count || 0;
  const applyInputsLimit = !largeSummariesEnabled && filteredInputsCount > 30;

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" gap="4px">
        <Box flex="1">
          <SummarizeButton />
        </Box>
        <Box flex="1">
          <QuestionButton
            onClick={() => setIsQuestionInputOpen(!isQuestionInputOpen)}
          />
        </Box>
      </Box>
      <Box
        m="0"
        my="8px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap="4px"
      >
        {applyInputsLimit && (
          <Icon name="alert-circle" fill={colors.orange500} />
        )}

        <Text
          fontSize="s"
          m="0"
          variant="bodyXs"
          color={applyInputsLimit ? 'orange500' : 'textSecondary'}
        >
          {`${filteredInputsCount} / ${inputsCount}`}{' '}
          {formatMessage(messages.inputsSelected)}
        </Text>
      </Box>

      {isQuestionInputOpen && (
        <QuestionInput onClose={() => setIsQuestionInputOpen(false)} />
      )}

      <Box flex="1" overflow="auto">
        {insights?.data.map((insight) => (
          <div key={insight.id}>
            {insight.relationships.insightable.data.type === 'summary' ? (
              <Summary insight={insight} />
            ) : (
              <Question insight={insight} />
            )}
          </div>
        ))}
        {!isLoading && insights?.data?.length === 0 && (
          <>
            <Text px="24px" color="grey600">
              {formatMessage(messages.emptyList)}
            </Text>
            <Text px="24px" color="grey600">
              {formatMessage(messages.emptyListDescription)}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Insights;
