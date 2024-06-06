import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import SurveyBars from 'components/admin/Graphs/SurveyBars';
import T from 'components/T';

import Files from '../Files';

import InputType from './InputType';
import PointLocationQuestion from './PointLocationQuestion';
import TextQuestion from './TextQuestion';

type FormResultsQuestionProps = {
  questionNumber: number;
  result: ResultUngrouped;
  totalSubmissions: number;
};

const COLOR_SCHEME = [colors.primary];

const FormResultsQuestion = ({
  questionNumber,
  result,
  totalSubmissions,
}: FormResultsQuestionProps) => {
  const localize = useLocalize();

  const {
    answers,
    textResponses,
    pointResponses,
    inputType,
    question,
    required,
    questionResponseCount,
    customFieldId,
    mapConfigId,
    files,
  } = result;

  const isMultipleChoiceAndHasAnswers = !!answers;
  const hasTextResponses = textResponses && textResponses.length > 0;
  const isPointAndHasAnswers =
    inputType === 'point' && pointResponses && pointResponses?.length > 0;

  return (
    <>
      <Box data-cy={`e2e-${snakeCase(localize(question))}`} mb="56px">
        <Title styleVariant="h3" mt="12px" mb="12px">
          {questionNumber}. <T value={question} />
        </Title>
        <InputType
          inputType={inputType}
          required={required}
          totalSubmissions={totalSubmissions}
          totalResponses={questionResponseCount}
        />
        {isMultipleChoiceAndHasAnswers && (
          <SurveyBars questionResult={result} colorScheme={COLOR_SCHEME} />
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
