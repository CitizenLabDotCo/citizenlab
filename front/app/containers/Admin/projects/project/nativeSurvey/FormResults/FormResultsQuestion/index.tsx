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
  required,
  customFieldId,
  textResponses = [],
  files = [],
  multilocs,
}: FormResultsQuestionProps) => {
  const isMultipleChoiceAndHasAnswers = !!answers;
  const hasTextResponses = textResponses && textResponses.length > 0;

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
        {isMultipleChoiceAndHasAnswers && (
          <MultipleChoice
            multipleChoiceAnswers={answers}
            totalResponses={questionResponseCount}
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
