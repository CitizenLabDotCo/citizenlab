import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import CommentSummary from './CommentSummary';
import SentimentHeader from './SentimentHeader';
import SentimentStats from './SentimentStats';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  textResponsesCount: number;
};

const SentimentResultTitle = ({ result, textResponsesCount }: Props) => {
  const isMobileOrSmaller = useBreakpoint('phone');
  const isTabletOrSmaller = useBreakpoint('tablet');

  return (
    <Box
      width="100%"
      display={isTabletOrSmaller ? 'block' : 'flex'}
      justifyContent="space-between"
      p="8px"
    >
      <Box mr="20px">
        <SentimentHeader result={result} />
      </Box>
      <Box
        display="flex"
        justifyContent={isMobileOrSmaller ? 'flex-start' : 'flex-end'}
      >
        {!isMobileOrSmaller && textResponsesCount > 0 && (
          <Box mr={isTabletOrSmaller ? '100px' : '160px'} my="auto">
            <CommentSummary count={textResponsesCount} />
          </Box>
        )}
        <SentimentStats result={result} />
      </Box>
    </Box>
  );
};

export default SentimentResultTitle;
