import React, { useMemo } from 'react';

import {
  Box,
  Button,
  colors,
  Icon,
  Image,
  Text,
} from '@citizenlab/cl2-component-library';

import { ResultUngrouped, ResultGrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import Bar from './Bar';
import messages from './messages';
import { parseQuestionResult } from './utils';

interface Props {
  questionResult: ResultUngrouped | ResultGrouped;
  colorScheme: string[];
  toggleLogicOptionIds?: (optionId: string) => void;
}

const SurveyBars = ({
  questionResult,
  colorScheme,
  toggleLogicOptionIds,
}: Props) => {
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

  return (
    <Box
      className={`e2e-survey-question-${
        questionResult.grouped ? 'grouped' : 'ungrouped'
      }-bars`}
    >
      {answers.map(
        ({ label, logicFilterId, count, percentage, image, bars }, index) => (
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
                  alt={label}
                />
              </Box>
            )}
            <Box width="100%">
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                my="12px"
              >
                <Text variant="bodyM" m="0">
                  {label}
                </Text>
                {logicFilterId && toggleLogicOptionIds && (
                  <Button
                    p="0px"
                    m="0px"
                    bgColor={colors.white}
                    // icon="logic"
                    // processing={isApproving}
                    // disabled={isApproving || importing}
                    onClick={() => {
                      toggleLogicOptionIds(logicFilterId);
                    }}
                  >
                    <Icon
                      fill={colors.coolGrey500}
                      width="18px"
                      name="logic"
                      my="auto"
                      mx="5px"
                    />
                  </Button>
                )}
                <Text variant="bodyS" color="textSecondary" m="0">
                  {formatMessage(messages.choiceCount, {
                    choiceCount: count,
                    percentage,
                  })}
                </Text>
              </Box>
              {bars.map((bar, index) => (
                <Bar key={index} {...bar} />
              ))}
            </Box>
          </Box>
        )
      )}
    </Box>
  );
};

export default SurveyBars;
