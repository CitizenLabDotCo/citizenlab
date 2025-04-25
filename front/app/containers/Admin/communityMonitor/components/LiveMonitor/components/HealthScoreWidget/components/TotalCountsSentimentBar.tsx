import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import SentimentBar from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/components/SentimentScore/SentimentBar';
import SentimentTooltip from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/components/SentimentScore/SentimentTooltip';
import { getAnswerGroups } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/components/SentimentScore/utils';
import { SentimentAnswers } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';

import { isNil } from 'utils/helperUtils';

import { QuarterlyScores } from '../types';
import { getQuarterFilter, getYearFilter } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
  year?: string;
  quarter?: string;
};
const TotalCountsSentimentBar = ({ sentimentScores, ...props }: Props) => {
  const [search] = useSearchParams();

  // Get the current year/quarter filter
  const year = props.year || getYearFilter(search);
  const quarter = props.quarter || getQuarterFilter(search);

  // Get the total counts data for the current quarter
  const quarterData = sentimentScores?.totalHealthScoreCounts.find(
    (healthScore) => healthScore.period === `${year}-${quarter}`
  );

  // Calculate the total # of responses for the quarter, so we can calculate a % next
  const quarterTotalResponses = quarterData?.totals.reduce(
    (acc, sentimentValueTotal) => acc + sentimentValueTotal.count,
    0
  );

  // For each sentiment value between 1 and 5, calculate the % of the total responses
  const quarterPercentages = !isNil(quarterTotalResponses)
    ? quarterData?.totals.map((sentimentValueTotal) => {
        return {
          percentage: Math.round(
            (sentimentValueTotal.count / quarterTotalResponses) * 100
          ),
        };
      })
    : [];

  // Generate the answer groups (low/neutral/high) to use in the sentiment bar
  const answerGroups =
    quarterPercentages &&
    getAnswerGroups({ questionAnswers: quarterPercentages });

  // Generate content for tooltip on hover
  const tooltipContent: SentimentAnswers = quarterPercentages?.map(
    (item, index) => {
      return {
        answer: index + 1,
        percentage: item.percentage,
      };
    }
  );

  return (
    <>
      {tooltipContent && (
        <Tooltip
          theme="dark"
          content={<SentimentTooltip answers={tooltipContent} />}
        >
          <SentimentBar answerGroups={answerGroups} />
        </Tooltip>
      )}
    </>
  );
};
export default TotalCountsSentimentBar;
