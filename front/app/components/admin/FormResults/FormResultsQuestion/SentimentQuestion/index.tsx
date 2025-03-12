import React from 'react';

import {
  Accordion,
  Box,
  colors,
  BoxProps,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { useIntl } from 'utils/cl-intl';

import Comments from './components/Comments';
import CommentSummary from './components/CommentSummary';
import SentimentHeader from './components/SentimentHeader';
import SentimentStats from './components/SentimentStats';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  showAnalysis?: boolean;
};

const SentimentQuestion = ({
  result,
  showAnalysis,
  ...props
}: Props & BoxProps) => {
  const isTabletOrSmaller = useBreakpoint('tablet');
  const isMobileOrSmaller = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  const { textResponses } = result;

  const textResponsesCount = textResponses?.length || 0;
  const hasTextResponses = textResponsesCount > 0;

  return (
    <Box mb="20px" background={colors.white} borderRadius="4px" {...props}>
      <Accordion
        borderRadius="4px"
        title={
          <Box
            width="100%"
            display={isTabletOrSmaller ? 'block' : 'flex'}
            justifyContent="space-between"
            p="8px"
          >
            <SentimentHeader result={result} />
            <Box
              display="flex"
              justifyContent={isMobileOrSmaller ? 'flex-start' : 'flex-end'}
            >
              {!isMobileOrSmaller && hasTextResponses && (
                <Box mr={isTabletOrSmaller ? '100px' : '160px'} my="auto">
                  <CommentSummary
                    count={textResponsesCount}
                    formatMessage={formatMessage}
                  />
                </Box>
              )}
              <SentimentStats result={result} />
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
