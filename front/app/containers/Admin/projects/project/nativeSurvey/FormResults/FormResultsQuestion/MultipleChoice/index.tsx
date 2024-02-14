import React from 'react';

// components
import { Box, colors, Image } from '@citizenlab/cl2-component-library';
import CompletionBar from './CompletionBar';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../../messages';

// typings
import { Answer } from 'api/survey_results/types';

// hooks
import useLocalize from 'hooks/useLocalize';

interface Props {
  multipleChoiceAnswers: Answer[];
  totalResponses: number;
}

const MultipleChoice = ({ multipleChoiceAnswers, totalResponses }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <>
      {multipleChoiceAnswers.map(({ answer, responses, image }, index) => {
        const percentage = Math.round((responses / totalResponses) * 1000) / 10;

        return (
          <Box
            key={index}
            maxWidth="524px"
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            {image?.small && (
              <Box mr="12px">
                <Image
                  width="48px"
                  height="48px"
                  src={image.small}
                  alt={localize(answer)}
                />
              </Box>
            )}
            <CompletionBar
              bgColor={colors.primary}
              completed={percentage}
              leftLabel={answer}
              rightLabel={formatMessage(messages.choiceCount, {
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
