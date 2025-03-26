import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import T from 'components/T';

import InputType from '../../InputType';

type Props = {
  result: ResultUngrouped | ResultGrouped;
};

const SentimentHeader = ({ result }: Props) => {
  const {
    question,
    questionNumber,
    inputType,
    required,
    totalResponseCount,
    questionResponseCount,
  } = result;

  return (
    <Box display="block" flexShrink={1}>
      <Title variant="h4" my="0px">
        {questionNumber && <>{questionNumber}. </>}
        <T value={question} />
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalResponseCount}
          totalResponses={questionResponseCount}
          mt="8px !important"
          mb="0px !important"
        />
      </Title>
    </Box>
  );
};

export default SentimentHeader;
