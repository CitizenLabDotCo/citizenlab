import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import { useParams } from 'react-router-dom';

import Summary from './Summary';
import SummarizeButton from './SummarizeButton';
import QuestionButton from './QuestionButton';

const Insights = () => {
  const [isQuestionInputOpen, setIsQuestionInputOpen] = useState(false);
  const { analysisId } = useParams() as { analysisId: string };
  const { data: insights, isLoading } = useAnalysisInsights({
    analysisId,
  });

  return (
    <Box>
      <Box display="flex" gap="4px">
        <SummarizeButton />
        <QuestionButton onClick={() => setIsQuestionInputOpen(true)} />
      </Box>
      {!isLoading && insights?.data?.length === 0 && (
        <>
          <Text px="24px" color="grey400">
            Your text summaries will be displayed here, but you currently do not
            have any yet.
          </Text>
          <Text px="24px" color="grey400">
            Start by adding some tags.
          </Text>
        </>
      )}
      {insights?.data.map((insight) => (
        <Summary key={insight.id} insight={insight} />
      ))}
    </Box>
  );
};

export default Insights;
