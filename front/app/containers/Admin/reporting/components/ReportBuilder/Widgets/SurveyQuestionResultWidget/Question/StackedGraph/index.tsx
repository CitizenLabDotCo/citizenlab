import React from 'react';

// components
import StackedBar from './StackedBar';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from 'containers/Admin/projects/project/nativeSurvey/messages';

// utils
import { round } from 'lodash-es';

// typings
import { SurveyQuestionResultResponse } from 'api/graph_data_units/responseTypes';

interface Props {
  surveyQuestionResult: SurveyQuestionResultResponse['data']['attributes'];
}

const StackedGraph = ({ surveyQuestionResult }: Props) => {
  const { formatMessage } = useIntl();

  const groupedAnswers = surveyQuestionResult.answers.reduce(
    (acc, { answer, group_by_value, count }) => {
      const question = answer || '@@missing_question';
      const groupByValue = group_by_value || '@@missing_group_by_value';

      if (!acc[question]) {
        acc[question] = {};
      }

      if (!acc[question][groupByValue]) {
        acc[question][groupByValue] = 0;
      }

      acc[question][groupByValue] += count;

      return acc;
    },
    {}
  );

  return (
    <>
      {Object.keys(groupedAnswers).map((questionKey) => {
        const choices = Object.values(groupedAnswers[questionKey]) as number[];

        const percentages = Object.keys(groupedAnswers[questionKey]).map(
          (key) =>
            (groupedAnswers[questionKey][key] /
              surveyQuestionResult.totalResponses) *
            100
        );

        return (
          <StackedBar
            key={questionKey}
            percentages={percentages}
            leftLabel={
              questionKey === '@@missing_question'
                ? { en: 'Missing question' }
                : surveyQuestionResult.multilocs.answer[questionKey]
            }
            rightLabel={formatMessage(messages.choiceCount, {
              choiceCount: choices.reduce((acc, v) => acc + v, 0),
              percentage: percentages.reduce((acc, p) => round(acc + p, 1), 0),
            })}
          />
        );
      })}
    </>
  );
};

export default StackedGraph;
