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
} from '@citizenlab/cl2-component-library';

import { ResultUngrouped } from 'api/survey_results/types';

import InputType from 'components/admin/FormResults/FormResultsQuestion/InputType';
import T from 'components/T';

import SentimentScore from './components/SentimentScore';
import { parseResult, SentimentAnswers } from './utils';

type Props = {
  result: ResultUngrouped;
  titleVariant?: TitleProps['variant'];
};

const SentimentQuestion = ({
  result,
  titleVariant,
  ...props
}: Props & BoxProps) => {
  const answers: SentimentAnswers = useMemo(() => {
    return parseResult(result);
  }, [result]);

  const {
    inputType,
    question,
    questionNumber,
    required,
    totalResponseCount,
    questionResponseCount,
  } = result;

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
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py="0px"
          >
            <Box display="block">
              <Title variant={titleVariant || 'h4'} mt="12px" mb="12px">
                {questionNumber}. <T value={question} />
              </Title>
              <InputType
                inputType={inputType}
                required={required}
                totalSubmissions={totalResponseCount}
                totalResponses={questionResponseCount}
              />
            </Box>

            <Box display="flex" gap="160px">
              <Box display="flex" gap="4px">
                <Icon
                  my="auto"
                  width="16px"
                  name="comment"
                  fill={colors.coolGrey500}
                />
                <Text my="auto" color="coolGrey700">
                  12 Comments
                </Text>
              </Box>
              <Box my="auto">
                <Box>
                  <Box display="flex" justifyContent="space-between" mb="4px">
                    <Box display="flex">
                      <Title color="grey800" m="0px" variant="h4">
                        2.1
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
                    <Text m="0px" color="green400" fontSize="s">
                      <Icon
                        mr="4px"
                        width="13px"
                        name="trend-up"
                        fill="green200"
                      />
                      +12%
                    </Text>
                  </Box>
                </Box>
                <SentimentScore answers={answers} />
              </Box>
            </Box>
          </Box>
        }
        border="1px solid rgb(218, 217, 217) !important"
        padding="20px"
      >
        <Box display="flex" gap="16px">
          <Box
            w="300px"
            h="260px"
            background={colors.coolGrey300}
            display="flex"
            gap="16px"
          >
            AI Summary
          </Box>
          <Box
            w="300px"
            h="260px"
            background={colors.grey100}
            display="flex"
            gap="16px"
          >
            Comment
          </Box>
          <Box
            w="300px"
            h="260px"
            background={colors.grey100}
            display="flex"
            gap="16px"
          >
            Comment
          </Box>
          <Box
            w="300px"
            h="260px"
            background={colors.grey100}
            display="flex"
            gap="16px"
          >
            Comment
          </Box>
        </Box>
      </Accordion>
    </Box>
  );
};

export default SentimentQuestion;
