import React from 'react';

import { Box, Title, Text, Tooltip } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';

import { LogicConfig, ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import Files from '../Files';
import messages from '../messages';

import FormResultQuestionValue from './components/FormResultsQuestionValue';
import InputType from './InputType';

type FormResultsQuestionProps = {
  result: ResultUngrouped;
  totalSubmissions: number;
  logicConfig: LogicConfig;
};

const FormResultsQuestion = ({
  result,
  totalSubmissions,
  logicConfig,
}: FormResultsQuestionProps) => {
  const { formatMessage } = useIntl();
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

  // As sentiment_linear_scale is also used in the Community Monitor results,
  // we need to handle it slightly differently.
  if (inputType === 'sentiment_linear_scale') {
    return (
      <>
        <FormResultQuestionValue result={result} logicConfig={logicConfig} />
      </>
    );
  }

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
        <Tooltip
          disabled={totalResponseCount === totalSubmissions}
          placement="bottom-start"
          content={formatMessage(messages.resultsCountQuestionTooltip)}
          theme="dark"
        >
          <InputType
            inputType={inputType}
            required={required}
            totalSubmissions={totalResponseCount}
            totalResponses={questionResponseCount}
          />
        </Tooltip>
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
