import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import InputType from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/InputType';
import MultipleChoice from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/MultipleChoice';

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
        {isMultipleChoiceAndHasAnswers && (
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
