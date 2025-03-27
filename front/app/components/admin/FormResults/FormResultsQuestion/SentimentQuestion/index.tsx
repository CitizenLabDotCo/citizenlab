import React from 'react';

import {
  Accordion,
  Box,
  colors,
  BoxProps,
} from '@citizenlab/cl2-component-library';

import { ResultUngrouped } from 'api/survey_results/types';

import Comments from './components/Comments';
import SentimentResultTitle from './components/SentimentResultTitle';

type Props = {
  result: ResultUngrouped;
  showAnalysis?: boolean;
  accordionMarginRight?: string; // Required for correction in report builder layout
};

const SentimentQuestion = ({
  result,
  showAnalysis,
  accordionMarginRight,
  ...props
}: Props & BoxProps) => {
  const { textResponses } = result;

  const textResponsesCount = textResponses?.length || 0;
  const hasTextResponses = textResponsesCount > 0;

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
    <Box
      mr={accordionMarginRight}
      mb="20px"
      background={colors.white}
      borderRadius="4px"
      {...props}
    >
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
