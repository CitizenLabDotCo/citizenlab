import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import SentimentBar from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/components/SentimentScore/SentimentBar';
import SentimentTooltip from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/components/SentimentScore/SentimentTooltip';
import { getAnswerGroups } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/components/SentimentScore/utils';

import { isNil } from 'utils/helperUtils';

import { QuarterlyScores } from '../types';
import { getQuarterFilter, getYearFilter } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
};
const TotalCountsSentimentBar = ({ sentimentScores }: Props) => {
  const [search] = useSearchParams();

  // Get the current year/quarter filter
  const year = getYearFilter(search);
  const quarter = getQuarterFilter(search);

  // Get the total counts data for the current quarter
  const quarterData = sentimentScores?.totalHealthScoreCounts.find(
    (_value, index) =>
      sentimentScores.totalHealthScoreCounts[index].period ===
      `${year}-${quarter}`
  );

  // Calculate the total responses for the quarter, so we can calculate a % next
  const quarterTotalResponses = quarterData?.totals.reduce(
    (acc, item) => acc + item.count,
    0
  );

  // For each sentiment  value between 1 and 5, calculate the % of the total responses
  const quarterPercentages = !isNil(quarterTotalResponses)
    ? quarterData?.totals.map((item) => {
        return {
          percentage: Math.round((item.count / quarterTotalResponses) * 100),
        };
      })
    : [];

  // Generate the answers groups (low/neutral/high) to use in the sentiment bar
  const answerGroups =
    quarterPercentages &&
    getAnswerGroups({ questionAnswers: quarterPercentages });

  // Generate content for tooltip on hover
  const tooltipContet = quarterPercentages?.map((item, index) => {
    return {
      answer: index + 1,
      percentage: item.percentage,
    };
  });

  return (
    <>
      {answerGroups && tooltipContet && (
        <Tooltip
          theme="dark"
          content={<SentimentTooltip answers={tooltipContet} />}
        >
          <SentimentBar answerGroups={answerGroups} />
        </Tooltip>
      )}
    </>
  );
};
export default TotalCountsSentimentBar;
