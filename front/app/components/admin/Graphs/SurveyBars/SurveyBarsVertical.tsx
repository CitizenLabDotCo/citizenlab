import React, { useMemo } from 'react';

import { Box, Image, Text } from '@citizenlab/cl2-component-library';

import { ResultUngrouped, ResultGrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { parseQuestionResult } from './utils';
import VerticalBar from './VerticalBar';

interface Props {
  questionResult: ResultUngrouped | ResultGrouped;
  colorScheme: string[];
}

const MAX_BARS = 12;
const TOTAL_WIDTH = 800;

const SurveyBarsVertical = ({ questionResult, colorScheme }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const answers = useMemo(() => {
    return parseQuestionResult(
      questionResult,
      colorScheme,
      localize,
      formatMessage(messages.noAnswer)
    );
  }, [questionResult, colorScheme, localize, formatMessage]);

  const barCount = Math.min(answers.length, MAX_BARS);
  const barWidth = `${TOTAL_WIDTH / barCount - 4}px`; // Subtracting gap

  return (
    <Box
      className={`e2e-survey-question-${
        questionResult.grouped ? 'grouped' : 'ungrouped'
      }-bars`}
      display="flex"
      flexDirection="row"
      alignItems="flex-end"
      justifyContent="center"
      height="400px"
      width={`${TOTAL_WIDTH}px`}
      gap="4px"
      ml="20px"
    >
      {answers.map(({ label, count, percentage, image, bars }, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-end"
          height="100%"
        >
          {image?.small && (
            <Box mb="12px">
              <Image width="48px" height="48px" src={image.small} alt={label} />
            </Box>
          )}
          <Box display="flex" flexDirection="column" alignItems="center">
            <Text
              variant="bodyS"
              color="textSecondary"
              m="0"
              mb="4px"
              style={{ whiteSpace: 'nowrap' }}
            >
              {percentage}%
            </Text>
            {/* <Text variant="bodyS" color="textSecondary" m="0" mb="4px" style={{ whiteSpace: 'nowrap' }}>
              {count}
            </Text>
            <Text variant="bodyS" color="textSecondary" m="0" mb="4px">
              {formatMessage(messages.response, {
                choiceCount: count,
                percentage,
              })}
            </Text> */}
            <Text
              variant="bodyS"
              color="textSecondary"
              m="0"
              mb="4px"
              textAlign="center"
            >
              {formatMessage(messages.responseCount, {
                choiceCount: count,
                percentage,
              })}
            </Text>
            {bars.map((bar, idx) => (
              <VerticalBar key={idx} {...bar} width={barWidth} />
            ))}
            <Text
              variant="bodyM"
              m="0"
              mt="4px"
              style={{ whiteSpace: 'nowrap' }}
            >
              {label}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SurveyBarsVertical;
