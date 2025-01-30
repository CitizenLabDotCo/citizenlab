import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';

import { LogicConfig, ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import Files from '../Files';

import FormResultQuestionValue from './components/FormResultsQuestionValue';
import InputType from './InputType';

type FormResultsQuestionProps = {
  result: ResultUngrouped;
  logicConfig: LogicConfig;
};

const FormResultsQuestion = ({
  result,
  logicConfig,
}: FormResultsQuestionProps) => {
  const localize = useLocalize();

  const {
    answers,
    inputType,
    question,
    description,
    questionNumber,
    required,
    totalResponseCount,
    questionResponseCount,
    files,
  } = result;

  if (result.hidden) return null;

  return (
    <Box
      border="1px solid #e0e0e0"
      borderRadius="4px"
      p="10px 20px 10px 20px"
      mb="20px"
    >
      <Box data-cy={`e2e-${snakeCase(localize(question))}`} mb="24px">
        <Title variant="h4" mt="12px" mb="12px">
          {questionNumber}. <T value={question} />
        </Title>
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalResponseCount}
          totalResponses={questionResponseCount}
        />
        <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
          <T value={description} supportHtml={true} />
        </Text>

        <FormResultQuestionValue result={result} logicConfig={logicConfig} />

        {files && files.length > 0 && (
          <Box display="flex" gap="24px" mt={answers ? '20px' : '0'} w="50%">
            <Box flex="1">
              <Files files={files} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FormResultsQuestion;
