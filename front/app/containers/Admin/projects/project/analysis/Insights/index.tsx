import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAnalysisSummaries from 'api/analysis_summaries/useAnalysisSummaries';

import { useParams } from 'react-router-dom';

import Summary from './Summary';

const Insights = () => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: summaries } = useAnalysisSummaries({
    analysisId,
  });

  return (
    <Box>
      {summaries?.data.map((summary) => (
        <Summary key={summary.id} summary={summary} />
      ))}
    </Box>
  );
};

export default Insights;
