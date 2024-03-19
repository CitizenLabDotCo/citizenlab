import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { Answer, AnswerMultilocs } from 'api/survey_results/types';

import SurveyBars from 'components/admin/Graphs/SurveyBars';

interface Props {
  multipleChoiceAnswers: Answer[];
  totalResponses: number;
  multilocs: AnswerMultilocs;
}

const COLOR_SCHEME = [colors.primary];

const MultipleChoice = ({
  multipleChoiceAnswers,
  totalResponses,
  multilocs,
}: Props) => {
  return (
    <SurveyBars
      grouped={false}
      answers={multipleChoiceAnswers}
      totalResponses={totalResponses}
      multilocs={multilocs}
      colorScheme={COLOR_SCHEME}
    />
  );
};

export default MultipleChoice;
