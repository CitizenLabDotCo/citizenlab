import React from 'react';

import {
  Accordion,
  Box,
  colors,
  BoxProps,
} from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import Comments from './components/Comments';
import GroupedSentimentScore from './components/GroupedSentimentScore/GroupedSentimentScore';
import SentimentResultTitle from './components/SentimentResultTitle';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  showAnalysis?: boolean;
  legendLabels?: string[];
};

const SentimentQuestion = ({
  result,
  showAnalysis,
  legendLabels,
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
        className="e2e-sentiment-question"
        {...props}
      >
        <SentimentResultTitle
          result={result}
          textResponsesCount={textResponsesCount}
        />
        {result.grouped && (
          <>
            {result.legend.map((groupKey, index) => (
              <GroupedSentimentScore
                key={groupKey}
                result={result}
                groupKey={groupKey}
                color={DEFAULT_CATEGORICAL_COLORS[index]}
                label={legendLabels?.[index] || groupKey}
              />
            ))}
          </>
        )}
      </Box>
    );
  }

  // Otherwise, show an accordion with the text responses in the body
  return (
    <Box
      mb="20px"
      background={colors.white}
      borderRadius="4px"
      {...props}
      className="e2e-sentiment-question"
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
      {result.grouped && (
        <>
          {result.legend.map((groupKey, index) => (
            <GroupedSentimentScore
              key={groupKey}
              result={result}
              groupKey={groupKey}
              color={DEFAULT_CATEGORICAL_COLORS[index]}
              label={legendLabels?.[index] || groupKey}
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default SentimentQuestion;
