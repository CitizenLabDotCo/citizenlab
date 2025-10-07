import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import Question from './Question';
import Summary from './Summary';

const Insights = ({
  analysisId,
  projectId,
  phaseId,
  selectedLocale,
}: {
  analysisId: string;
  projectId: string;
  phaseId?: string;
  selectedLocale: string;
}) => {
  const { formatMessage } = useIntl();
  const { data: insights, isLoading } = useAnalysisInsights({
    analysisId,
  });

  if (!projectId || !phaseId) {
    return null;
  }

  if (!insights?.data.length && !isLoading) {
    return <Text>{formatMessage(messages.noInsights)}</Text>;
  }

  return (
    <Box display="flex" flexDirection="column" gap="8px" mb="8px">
      {insights?.data.map((insight) => (
        <Box key={insight.id}>
          {insight.relationships.insightable.data.type ===
          'analysis_question' ? (
            <Question
              key={insight.relationships.insightable.data.id}
              questionId={insight.relationships.insightable.data.id}
              analysisId={analysisId}
              projectId={projectId}
              phaseId={phaseId}
              selectedLocale={selectedLocale}
            />
          ) : (
            <Summary
              key={insight.relationships.insightable.data.id}
              summaryId={insight.relationships.insightable.data.id}
              analysisId={analysisId}
              projectId={projectId}
              phaseId={phaseId}
              selectedLocale={selectedLocale}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Insights;
