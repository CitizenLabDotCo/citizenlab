import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import CompletionBar from './CompletionBar';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../../messages';

// typings
import { Answer } from 'api/survey_results/types';

interface Props {
  multipleChoiceAnswers: Answer[];
  totalResponses: number;
}

const MultipleChoice = ({ multipleChoiceAnswers, totalResponses }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      {multipleChoiceAnswers.map(({ answer, responses }, index) => {
        const percentage = Math.round((responses / totalResponses) * 1000) / 10;

        return (
          <Box key={index} maxWidth="524px">
            <CompletionBar
              bgColor={colors.primary}
              completed={percentage}
              leftLabel={answer}
              rightLabel={formatMessage(messages.choiceCount2, {
                choiceCount: responses,
                percentage,
              })}
            />
          </Box>
        );
      })}
    </>
  );
};

export default MultipleChoice;
