import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { Locale } from 'typings';

import { Result } from 'api/survey_results/types';

import InputType from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/InputType';
import MultipleChoice from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/MultipleChoice';

import T from 'components/T';

type FormResultsQuestionProps = Result & {
  locale: Locale;
  totalSubmissions: number;
};

const FormResultsQuestion = ({
  locale,
  question,
  inputType,
  answers,
  questionResponseCount,
  required,
  totalSubmissions,
  multilocs,
}: FormResultsQuestionProps) => {
  const isMultipleChoiceAndHasAnswers = !!answers;

  return (
    <>
      <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
        <Title variant="h5" mt="12px" mb="12px">
          <T value={question} />
        </Title>
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalSubmissions}
          totalResponses={questionResponseCount}
        />
        {isMultipleChoiceAndHasAnswers && multilocs && (
          <MultipleChoice
            multipleChoiceAnswers={answers}
            totalResponses={questionResponseCount}
            multilocs={multilocs}
          />
        )}
      </Box>
    </>
  );
};
export default FormResultsQuestion;
