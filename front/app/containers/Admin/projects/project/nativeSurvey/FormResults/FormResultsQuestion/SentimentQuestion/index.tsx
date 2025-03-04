import React, { useMemo } from 'react';

import {
  Accordion,
  Box,
  Title,
  Text,
  Icon,
} from '@citizenlab/cl2-component-library';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import SentimentScore from './components/SentimentScore';
import { parseResult, SentimentAnswers } from './utils';

type Props = {
  result: ResultUngrouped;
};

const SentimentQuestion = ({ result }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const answers: SentimentAnswers = useMemo(() => {
    return parseResult(result);
  }, [result]);

  return (
    <Accordion
      title={
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py="20px"
        >
          <Title m="0px" variant="h5">
            {localize(result.question)}
          </Title>
          <Box display="flex" gap="24px">
            <Text m="0px">12 Comments</Text>
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
                  <Text m="0px" color="green300">
                    <Icon name="trend-up" fill="green300" />
                    +12%
                  </Text>
                </Box>
              </Box>
              <SentimentScore answers={answers} />
            </Box>
          </Box>
        </Box>
      }
      border="none !important"
    >
      COMMENTS GO HERE
    </Accordion>
  );
};

export default SentimentQuestion;
