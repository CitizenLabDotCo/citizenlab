import React, { useMemo } from 'react';

import {
  Accordion,
  Box,
  Title,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

import { ResultUngrouped } from 'api/survey_results/types';

import T from 'components/T';

import InputType from '../InputType';

import SentimentScore from './components/SentimentScore';
import { parseResult, SentimentAnswers } from './utils';

type Props = {
  result: ResultUngrouped;
};

const SentimentQuestion = ({ result }: Props) => {
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
    <Accordion
      title={
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py="0px"
        >
          <Box display="block">
            <Title variant="h4" mt="12px" mb="12px">
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
              <Icon my="auto" name="comment" fill={colors.coolGrey700} />
              <Text my="auto" color="coolGrey700">
                12 Comments
              </Text>
            </Box>
            <Box my="auto">
              <Box>
                <Box display="flex" justifyContent="space-between" mb="8px">
                  <Box display="flex">
                    <Title color="grey800" m="0px" variant="h3">
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
                  <Text m="0px" color="green400">
                    <Icon
                      mr="4px"
                      width="20px"
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
      marginBottom="16px"
      padding="20px"
    >
      <Box display="flex" gap="16px">
        <Box
          w="300px"
          h="260px"
          background={colors.grey200}
          display="flex"
          gap="16px"
        />
        <Box
          w="300px"
          h="260px"
          background={colors.grey200}
          display="flex"
          gap="16px"
        />
        <Box
          w="300px"
          h="260px"
          background={colors.grey200}
          display="flex"
          gap="16px"
        />
        <Box
          w="300px"
          h="260px"
          background={colors.grey200}
          display="flex"
          gap="16px"
        />
      </Box>
    </Accordion>
  );
};

export default SentimentQuestion;
