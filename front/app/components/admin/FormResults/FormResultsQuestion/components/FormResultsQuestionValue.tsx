import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { ICustomFieldInputType } from 'api/custom_fields/types';
import { LogicConfig, ResultUngrouped } from 'api/survey_results/types';

import SurveyBarsHorizontal from 'components/admin/Graphs/SurveyBars/SurveyBarsHorizontal';
import SurveyBarsVertical from 'components/admin/Graphs/SurveyBars/SurveyBarsVertical';

import LineLocationQuestion from '../MappingQuestions/LineLocationQuestion';
import PointLocationQuestion from '../MappingQuestions/PointLocationQuestion';
import PolygonLocationQuestion from '../MappingQuestions/PolygonLocationQuestion';
import MatrixQuestion from '../MatrixQuestion';
import NumberQuestion from '../NumberQuestion';
import RankingQuestion from '../RankingQuestion';
import SentimentQuestion from '../SentimentQuestion';
import TextQuestion from '../TextQuestion';
import { determineAnswerType } from '../utils';

type FormResultQuestionValueProps = {
  result: ResultUngrouped;
  logicConfig: LogicConfig;
};

const FormResultQuestionValue = ({
  result,
  logicConfig,
}: FormResultQuestionValueProps) => {
  const hasAnswersOfType: ICustomFieldInputType | undefined =
    determineAnswerType(result);

  const {
    answers,
    textResponses,
    pointResponses,
    lineResponses,
    polygonResponses,
    numberResponses,
    customFieldId,
    mapConfigId,
  } = result;

  switch (hasAnswersOfType) {
    case 'ranking':
      return <RankingQuestion result={result} />;
    case 'rating':
      return (
        <SurveyBarsVertical
          questionResult={result}
          colorScheme={[colors.primary]}
          logicConfig={logicConfig}
        />
      );
    case 'matrix_linear_scale':
      return <MatrixQuestion result={result} />;
    case 'sentiment_linear_scale':
      return <SentimentQuestion result={result} />;
    case 'multiselect':
      return (
        <>
          <SurveyBarsHorizontal
            questionResult={result}
            colorScheme={[colors.primary]}
            logicConfig={logicConfig}
          />
          {textResponses && (
            <TextQuestion
              textResponses={textResponses}
              customFieldId={customFieldId}
              hasOtherResponses={!!answers}
            />
          )}
        </>
      );
    case 'text':
      return textResponses ? (
        <TextQuestion
          textResponses={textResponses}
          customFieldId={customFieldId}
          hasOtherResponses={!!answers}
        />
      ) : null;

    case 'number': {
      return numberResponses ? (
        <NumberQuestion numberResponses={numberResponses} />
      ) : null;
    }
    case 'point': {
      return pointResponses ? (
        <PointLocationQuestion
          pointResponses={pointResponses}
          mapConfigId={mapConfigId}
          customFieldId={customFieldId}
        />
      ) : null;
    }
    case 'line': {
      return lineResponses ? (
        <LineLocationQuestion
          lineResponses={lineResponses}
          mapConfigId={mapConfigId}
          customFieldId={customFieldId}
        />
      ) : null;
    }
    case 'polygon': {
      return polygonResponses ? (
        <PolygonLocationQuestion
          polygonResponses={polygonResponses}
          mapConfigId={mapConfigId}
          customFieldId={customFieldId}
        />
      ) : null;
    }
    default:
      return null;
  }
};

export default FormResultQuestionValue;
