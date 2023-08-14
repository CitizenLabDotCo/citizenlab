import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAnalysisSummaries from 'api/analysis_summaries/useAnalysisSummaries';

import { useParams } from 'react-router-dom';

import Summary from './Summary';

type Props = {
  onSelectInput: (inputId: string) => void;
};
const Insights = ({ onSelectInput }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: summaries, isLoading } = useAnalysisSummaries({
    analysisId,
  });

  return (
    <Box>
      {!isLoading && summaries?.data?.length === 0 && (
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
      {summaries?.data.map((summary) => (
        <Summary
          key={summary.id}
          summary={summary}
          onSelectInput={onSelectInput}
        />
      ))}
    </Box>
  );
};

export default Insights;
