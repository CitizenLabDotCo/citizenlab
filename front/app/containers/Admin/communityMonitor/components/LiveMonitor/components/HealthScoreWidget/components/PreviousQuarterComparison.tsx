import React from 'react';

import { useSearchParams } from 'react-router-dom';

import { getPercentageDifference } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';
import TrendIndicator from 'components/TrendIndicator';

import { QuarterlyScores } from '../types';
import { getQuarterFilter, getYearFilter } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
};

const PreviousQuarterComparison = ({ sentimentScores }: Props) => {
  const [search] = useSearchParams();

  const year = getYearFilter(search);
  const quarter = getQuarterFilter(search);

  const thisPeriodIndex = sentimentScores?.overallHealthScores.findIndex(
    (value) => value.period === `${year}-${quarter}`
  );

  const thisPeriodAvg =
    sentimentScores?.overallHealthScores[thisPeriodIndex!]?.score;

  const lastPeriodAvg =
    sentimentScores?.overallHealthScores[thisPeriodIndex! - 1]?.score;

  const percentageDifference = getPercentageDifference(
    thisPeriodAvg,
    lastPeriodAvg
  );

  return (
    <>
      <TrendIndicator
        percentageDifference={percentageDifference}
        showQuarterComparisonLabel={true}
      />
    </>
  );
};

export default PreviousQuarterComparison;
