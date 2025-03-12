import React, { useMemo } from 'react';

import {
  Accordion,
  Box,
  Title,
  Text,
  Icon,
  colors,
  BoxProps,
  TitleProps,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import InputType from 'components/admin/FormResults/FormResultsQuestion/InputType';
import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import Comments from './components/Comments';
import SentimentScore from './components/SentimentScore';
import messages from './messages';
import { parseResult, SentimentAnswers } from './utils';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  titleVariant?: TitleProps['variant'];
  showAnalysis?: boolean;
};

const SentimentQuestion = ({
  result,
  titleVariant,
  showAnalysis,
  ...props
}: Props & BoxProps) => {
  const isTabletOrSmaller = useBreakpoint('tablet');
  const isMobileOrSmaller = useBreakpoint('phone');

  const { formatMessage } = useIntl();

  const answers: SentimentAnswers = useMemo(() => {
    return parseResult(result);
  }, [result]);

  const {
    inputType,
    question,
    questionNumber,
    textResponses,
    required,
    totalResponseCount,
    questionResponseCount,
    averages,
  } = result;

  // Handle text responses
  const answersCount = textResponses?.length;
  const hasTextResponses = !!answersCount && answersCount > 0;

  // Handle calculation for this and last period, if applicable
  const thisPeriodAvg = averages?.this_period;
  const lastPeriodAvg = averages?.last_period;

  const getPercentDifference = () => {
    if (thisPeriodAvg && lastPeriodAvg) {
      return ((thisPeriodAvg - lastPeriodAvg) / lastPeriodAvg) * 100;
    }

    return null;
  };

  const percentageDifference = getPercentDifference();

  return (
    <Box
      marginBottom="20px"
      background={colors.white}
      borderRadius="4px"
      {...props}
    >
      <Accordion
        borderRadius="4px"
        title={
          <Box
            width="100%"
            display={isTabletOrSmaller ? 'block' : 'flex'}
            justifyContent="space-between"
          >
            <Box display="block" maxWidth="480px">
              <Title
                variant={titleVariant || 'h4'}
                my="12px"
                fontWeight="semi-bold"
              >
                {questionNumber && <>{questionNumber}. </>}
                <T value={question} />
              </Title>
              <InputType
                inputType={inputType}
                required={required}
                totalSubmissions={totalResponseCount}
                totalResponses={questionResponseCount}
              />
            </Box>

            <Box
              display="flex"
              gap={isTabletOrSmaller ? '5%' : '50%'}
              justifyContent={isMobileOrSmaller ? 'flex-start' : 'flex-end'}
            >
              {!isMobileOrSmaller && hasTextResponses && (
                <Box display="flex" gap="4px">
                  <Box my="auto">
                    <Icon
                      width="16px"
                      name="comment"
                      fill={colors.coolGrey500}
                    />
                  </Box>
                  <Text my="auto" color="coolGrey700" style={{ flexShrink: 0 }}>
                    {formatMessage(messages.xComments, {
                      count: answersCount || 0,
                    })}
                  </Text>
                </Box>
              )}

              <Box my="auto">
                <Box>
                  <Box display="flex" justifyContent="space-between" mb="4px">
                    <Box display="flex">
                      <Title color="grey800" m="0px" variant="h4">
                        {averages?.this_period}
                      </Title>
                      <Text
                        color="grey700"
                        fontSize="s"
                        fontWeight="semi-bold"
                        m="0px"
                        mt="auto"
                      >
                        /5
                      </Text>
                    </Box>
                    {percentageDifference && (
                      <Text m="0px" color="green500" fontSize="s">
                        <Icon
                          mr="4px"
                          width="13px"
                          name="trend-up"
                          fill="green500"
                        />
                        {percentageDifference >= 0 ? '+' : '-'}
                        {percentageDifference}%
                      </Text>
                    )}
                  </Box>
                </Box>
                <SentimentScore answers={answers} />
              </Box>
            </Box>
          </Box>
        }
        border={`1px solid ${colors.borderLight}`}
        px="12px"
        py="16px"
      >
        {textResponses && (
          <Comments
            customFieldId={result.customFieldId}
            textResponses={textResponses}
            showAnalysis={showAnalysis}
          />
        )}
      </Accordion>
    </Box>
  );
};

export default SentimentQuestion;
