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
const GAP_SIZE = 6;

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
  const columnWidth = TOTAL_WIDTH / barCount - GAP_SIZE;

  return (
    <Box
      className={`e2e-survey-question-${
        questionResult.grouped ? 'grouped' : 'ungrouped'
      }-bars`}
      display="flex"
      flexDirection="row"
      alignItems="flex-end"
      justifyContent="flex-start"
      height="250px"
      width="100%"
      gap={`${GAP_SIZE}px`}
      overflow="hidden"
    >
      {answers.map(({ label, count, percentage, image, bars }, index) => {
        const hasMultipleBars = bars.length > 1;
        const barWidth = hasMultipleBars
          ? `${(columnWidth - GAP_SIZE * (bars.length - 1)) / bars.length}px`
          : `${columnWidth}px`;

        return (
          <Box
            key={index}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-end"
            height="100%"
            width={`${columnWidth}px`}
          >
            {image?.small && (
              <Box mb="12px">
                <Image
                  width="48px"
                  height="48px"
                  src={image.small}
                  alt={label}
                />
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
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="flex-end"
                gap={`${GAP_SIZE / 2}px`}
                width="100%"
              >
                {bars.map((bar, idx) => (
                  <VerticalBar key={idx} {...bar} width={barWidth} />
                ))}
              </Box>
              <Box mt="6px" maxWidth={`${columnWidth}px`} overflow="hidden">
                {label.length > 6 ? (
                  <Tooltip theme="dark" placement="bottom" content={label}>
                    <Text
                      variant="bodyM"
                      m="0"
                      as="span"
                      textAlign="center"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {label.substring(0, 6)}...
                    </Text>
                  </Tooltip>
                ) : (
                  <Text variant="bodyM" m="0">
                    {label}
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default SurveyBarsVertical;
