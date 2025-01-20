import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import Files from '../Files';

import FormResultQuestionValue from './components/FormResultsQuestionValue';
import InputType from './InputType';

type FormResultsQuestionProps = {
  questionNumber: number;
  result: ResultUngrouped;
  totalSubmissions: number;
};

const FormResultsQuestion = ({
  questionNumber,
  result,
  totalSubmissions,
}: FormResultsQuestionProps) => {
  const localize = useLocalize();

  const {
    answers,
    inputType,
    question,
    required,
    questionResponseCount,
    files,
  } = result;

  return (
    <>
      <Box data-cy={`e2e-${snakeCase(localize(question))}`} mb="56px">
        <Title variant="h3" mt="12px" mb="12px">
          {questionNumber}. <T value={question} />
        </Title>
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalSubmissions}
          totalResponses={questionResponseCount}
        />

        <FormResultQuestionValue result={result} />

        {files && files.length > 0 && (
          <Box display="flex" gap="24px" mt={answers ? '20px' : '0'} w="50%">
            <Box flex="1">
              <Files files={files} />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default FormResultsQuestion;
