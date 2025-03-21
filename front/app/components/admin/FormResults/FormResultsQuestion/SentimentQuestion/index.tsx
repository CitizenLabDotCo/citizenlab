import React from 'react';

import {
  Accordion,
  Box,
  colors,
  BoxProps,
} from '@citizenlab/cl2-component-library';
import { isNil } from 'lodash-es';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import Comments from './components/Comments';
import SentimentResultTitle from './components/SentimentResultTitle';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  showAnalysis?: boolean;
};

const SentimentQuestion = ({
  result,
  showAnalysis,
  ...props
}: Props & BoxProps) => {
  const { textResponses, averages } = result;

  const textResponsesCount = textResponses?.length || 0;
  const hasTextResponses = textResponsesCount > 0;

  if (isNil(averages?.this_period)) {
    return null;
  }

  // Don't show an accordion if there are no text responses
  if (!hasTextResponses && !showAnalysis) {
    return (
      <Box
        mb="20px"
        p="16px"
        pr="52px"
        background={colors.white}
        border={`1px solid ${colors.borderLight}`}
        borderRadius="4px"
        {...props}
      >
        <SentimentResultTitle
          result={result}
          textResponsesCount={textResponsesCount}
        />
      </Box>
    );
  }

  // Otherwise, show an accordion with the text responses in the body
  return (
    <Box mb="20px" background={colors.white} borderRadius="4px" {...props}>
      <Accordion
        borderRadius="4px"
        title={
          <SentimentResultTitle
            result={result}
            textResponsesCount={textResponsesCount}
          />
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
