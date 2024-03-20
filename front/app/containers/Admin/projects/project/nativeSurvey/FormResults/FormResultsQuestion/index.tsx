import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { Locale } from 'typings';

import { Result } from 'api/survey_results/types';

import T from 'components/T';

import Files from '../Files';

import InputType from './InputType';
import MultipleChoice from './MultipleChoice';
import PointLocationQuestion from './PointLocationQuestion';
import TextQuestion from './TextQuestion';

type FormResultsQuestionProps = Result & {
  questionNumber: number;
  locale: Locale;
  totalSubmissions: number;
};

const FormResultsQuestion = ({
  questionNumber,
  locale,
  question,
  inputType,
  answers,
  questionResponseCount,
  totalSubmissions,
  totalPickCount,
  pointResponses = [],
  required,
  customFieldId,
  mapConfigId,
  textResponses = [],
  files = [],
  multilocs,
}: FormResultsQuestionProps) => {
  const isMultipleChoiceAndHasAnswers = !!answers;
  const hasTextResponses = textResponses && textResponses.length > 0;
  const isPointAndHasAnswers =
    inputType === 'point' && pointResponses?.length > 0;

  return (
    <>
      <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
        <Title variant="h3" mt="12px" mb="12px">
          {questionNumber}. <T value={question} />
        </Title>
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalSubmissions}
          totalResponses={questionResponseCount}
        />
        {isMultipleChoiceAndHasAnswers && multilocs && totalPickCount && (
          <MultipleChoice
            multipleChoiceAnswers={answers}
            totalResponses={totalPickCount}
            multilocs={multilocs}
          />
        )}
        {hasTextResponses && (
          <TextQuestion
            textResponses={textResponses}
            customFieldId={customFieldId}
            hasOtherResponses={isMultipleChoiceAndHasAnswers}
          />
        )}
        {isPointAndHasAnswers && (
          <PointLocationQuestion
            pointResponses={pointResponses}
            mapConfigId={mapConfigId}
            customFieldId={customFieldId}
          />
        )}
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
