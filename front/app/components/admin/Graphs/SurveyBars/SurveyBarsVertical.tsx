import React, { useMemo } from 'react';

import { Box, Image, Text, Tooltip } from '@citizenlab/cl2-component-library';

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
const TOTAL_WIDTH = 650;

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
      justifyContent="flex-start"
      height="400px"
      width="100%"
      gap="4px"
      overflow="hidden"
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
            <Tooltip
              theme="dark"
              placement="bottom"
              content={formatMessage(messages.responseCount, {
                choiceCount: count,
                percentage,
              })}
            >
              <div>
                <Text
                  variant="bodyS"
                  color="textSecondary"
                  m="0"
                  mb="4px"
                  textAlign="center"
                >
                  {percentage}%
                </Text>
              </div>
            </Tooltip>
            {bars.map((bar, idx) => (
              <VerticalBar key={idx} {...bar} width={barWidth} />
            ))}
            {label.length > 6 ? (
              <Tooltip theme="dark" placement="bottom" content={label}>
                <Text
                  variant="bodyM"
                  m="0"
                  mt="4px"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {label.substring(0, 6)}...
                </Text>
              </Tooltip>
            ) : (
              <Text
                variant="bodyM"
                m="0"
                mt="4px"
                style={{ whiteSpace: 'nowrap' }}
              >
                {label}
              </Text>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SurveyBarsVertical;
