import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import InputType from './InputType';
import MultipleChoice from './MultipleChoice';
import TextQuestion from './TextQuestion';
import Files from '../Files';

// i18n
import T from 'components/T';

// utils
import { snakeCase } from 'lodash-es';

// typings
import { Locale } from 'typings';
import { Result } from 'api/survey_results/types';

type FormResultsQuestionProps = Result & {
  locale: Locale;
  totalSubmissions: number;
};

const FormResultsQuestion = ({
  locale,
  question,
  inputType,
  answers,
  totalResponses,
  totalSubmissions,
  required,
  customFieldId,
  textResponses = [],
  files = [],
}: FormResultsQuestionProps) => {
  const isMultipleChoiceAndHasAnswers = !!answers;
  const hasTextResponses = textResponses && textResponses.length > 0;

  return (
    <>
      <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
        <Title variant="h3" mt="12px" mb="12px">
          <T value={question} />
        </Title>
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalSubmissions}
          totalResponses={totalResponses}
        />
        {isMultipleChoiceAndHasAnswers && (
          <MultipleChoice
            multipleChoiceAnswers={answers}
            totalResponses={totalResponses}
          />
        )}
        {hasTextResponses && (
          <TextQuestion
            textResponses={textResponses}
            customFieldId={customFieldId}
            hasOtherResponses={isMultipleChoiceAndHasAnswers}
          />
        )}
      </Box>
      {files && files.length > 0 && (
        <Box display="flex" gap="24px" mt={answers ? '20px' : '0'}>
          <Box flex="1">
            <Files files={files} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default FormResultsQuestion;
