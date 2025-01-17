import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';

import { ICustomFieldInputType } from 'api/custom_fields/types';
import { ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import SurveyBars from 'components/admin/Graphs/SurveyBars';
import T from 'components/T';

import Files from '../Files';

import InputType from './InputType';
import LineLocationQuestion from './MappingQuestions/LineLocationQuestion';
import PointLocationQuestion from './MappingQuestions/PointLocationQuestion';
import PolygonLocationQuestion from './MappingQuestions/PolygonLocationQuestion';
import NumberQuestion from './NumberQuestion';
import RankingQuestion from './RankingQuestion';
import TextQuestion from './TextQuestion';
import { determineAnswerType } from './utils';

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
    lineResponses,
    polygonResponses,
    numberResponses,
    inputType,
    question,
    required,
    questionResponseCount,
    customFieldId,
    mapConfigId,
    files,
  } = result;

  const hasAnswersOfType: ICustomFieldInputType | undefined =
    determineAnswerType(result);

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

        {(() => {
          switch (hasAnswersOfType) {
            case 'ranking':
              return <RankingQuestion result={result} />;
            case 'multiselect':
              return (
                <SurveyBars
                  questionResult={result}
                  colorScheme={COLOR_SCHEME}
                />
              );
            case 'text':
              if (textResponses) {
                return (
                  <TextQuestion
                    textResponses={textResponses}
                    customFieldId={customFieldId}
                    hasOtherResponses={!!answers}
                  />
                );
              }
              return null;
            case 'number': {
              if (numberResponses) {
                return <NumberQuestion numberResponses={numberResponses} />;
              }
              return null;
            }
            case 'point': {
              if (pointResponses) {
                return (
                  <PointLocationQuestion
                    pointResponses={pointResponses}
                    mapConfigId={mapConfigId}
                    customFieldId={customFieldId}
                  />
                );
              }
              return null;
            }
            case 'line': {
              if (lineResponses) {
                return (
                  <LineLocationQuestion
                    lineResponses={lineResponses}
                    mapConfigId={mapConfigId}
                    customFieldId={customFieldId}
                  />
                );
              }
              return null;
            }
            case 'polygon': {
              if (polygonResponses) {
                return (
                  <PolygonLocationQuestion
                    polygonResponses={polygonResponses}
                    mapConfigId={mapConfigId}
                    customFieldId={customFieldId}
                  />
                );
              }
              return null;
            }
            default:
              return null;
          }
        })()}

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
