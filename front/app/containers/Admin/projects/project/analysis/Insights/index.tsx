import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import { useParams } from 'react-router-dom';

import Summary from './Summary';
import SummarizeButton from './SummarizeButton';
import QuestionButton from './QuestionButton';
import QuestionInput from './QuestionInput';
import Question from './Question';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import translations from './translations';
import { useIntl } from 'utils/cl-intl';

const Insights = () => {
  const { formatMessage } = useIntl();
  const [isQuestionInputOpen, setIsQuestionInputOpen] = useState(false);
  const { analysisId } = useParams() as { analysisId: string };
  const { data: insights, isLoading } = useAnalysisInsights({
    analysisId,
  });
  const filters = useAnalysisFilterParams();
  const { data } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputsCount = data?.pages[0].meta.filtered_count;

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
      <Box m="0" mb="12px" display="flex" justifyContent="center">
        <Text fontSize="s" m="0" variant="bodyXs" color="grey700">
          {formatMessage(translations.appliesTo)} ({inputsCount})
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
              {formatMessage(translations.emptyList)}
            </Text>
            <Text px="24px" color="grey600">
              {formatMessage(translations.emptyListDescription)}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Insights;
