import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { ICustomFieldInputType } from 'api/custom_fields/types';
import { ResultUngrouped } from 'api/survey_results/types';

import SurveyBars from 'components/admin/Graphs/SurveyBars/SurveyBarsHorizontal';
import SurveyBarsVertical from 'components/admin/Graphs/SurveyBars/SurveyBarsVertical';

import LineLocationQuestion from '../MappingQuestions/LineLocationQuestion';
import PointLocationQuestion from '../MappingQuestions/PointLocationQuestion';
import PolygonLocationQuestion from '../MappingQuestions/PolygonLocationQuestion';
import MatrixQuestion from '../MatrixQuestion';
import NumberQuestion from '../NumberQuestion';
import RankingQuestion from '../RankingQuestion';
import TextQuestion from '../TextQuestion';
import { determineAnswerType } from '../utils';

type FormResultQuestionValueProps = {
  result: ResultUngrouped;
};

const FormResultQuestionValue = ({ result }: FormResultQuestionValueProps) => {
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
        />
      );
    case 'matrix_linear_scale':
      return <MatrixQuestion result={result} />;
    case 'multiselect':
      return (
        <SurveyBars questionResult={result} colorScheme={[colors.primary]} />
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
