import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import InputType from 'components/admin/FormResults/FormResultsQuestion/InputType';
import T from 'components/T';

type Props = {
  result: ResultUngrouped | ResultGrouped;
};

const SentimentHeader = ({ result }: Props) => {
  const {
    inputType,
    question,
    questionNumber,
    required,
    totalResponseCount,
    questionResponseCount,
  } = result;

  return (
    <Box display="block" maxWidth="480px">
      <Title variant="h4" my="12px">
        {questionNumber && <>{questionNumber}. </>}
        <T value={question} />
      </Title>
      <InputType
        inputType={inputType}
        required={required}
        totalSubmissions={totalResponseCount}
        totalResponses={questionResponseCount}
      />
    </Box>
  );
};

export default SentimentHeader;
