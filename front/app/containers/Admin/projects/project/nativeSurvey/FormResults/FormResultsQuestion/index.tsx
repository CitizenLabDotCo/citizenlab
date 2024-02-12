import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import InputType from './InputType';
import MultipleChoice from './MultipleChoice';
import TextQuestion from './TextQuestion';

// i18n
import T from 'components/T';

// utils
import { snakeCase } from 'lodash-es';

// typings
import { Locale, Multiloc } from 'typings';
import { Answer } from 'api/survey_results/types';

type FormResultsQuestionProps = {
  locale: Locale;
  question: Multiloc;
  inputType: string;
  answers?: Answer[];
  totalResponses: number;
  required: boolean;
  customFieldId: string;
  textResponses?: { answer: string }[];
};

const FormResultsQuestion = ({
  locale,
  question,
  inputType,
  answers,
  totalResponses,
  required,
  customFieldId,
  textResponses = [],
}: FormResultsQuestionProps) => {
  const isMultipleChoice = !!answers;

  return (
    <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
      <Title variant="h3" mt="12px" mb="12px">
        <T value={question} />
      </Title>
      <InputType inputType={inputType} required={required} />
      {isMultipleChoice ? (
        <MultipleChoice
          multipleChoiceAnswers={answers}
          totalResponses={totalResponses}
        />
      ) : (
        <TextQuestion
          textResponses={textResponses}
          customFieldId={customFieldId}
        />
      )}
    </Box>
  );
};

export default FormResultsQuestion;
