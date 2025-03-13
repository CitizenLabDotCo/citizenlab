import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import T from 'components/T';

type Props = {
  result: ResultUngrouped | ResultGrouped;
};

const SentimentHeader = ({ result }: Props) => {
  const { question, questionNumber } = result;

  return (
    <Box display="block" flexShrink={1}>
      <Title variant="h4" my="8px">
        {questionNumber && <>{questionNumber}. </>}
        <T value={question} />
      </Title>
    </Box>
  );
};

export default SentimentHeader;
