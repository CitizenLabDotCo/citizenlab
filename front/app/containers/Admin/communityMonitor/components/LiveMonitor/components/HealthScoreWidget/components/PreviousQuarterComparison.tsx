import React from 'react';

import { useSearchParams } from 'react-router-dom';

import { getPercentageDifference } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';
import TrendIndicator from 'components/TrendIndicator';

import { QuarterlyScores } from '../types';
import { getQuarterFilter, getYearFilter } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
  year?: string;
  quarter?: string;
};

const PreviousQuarterComparison = ({ sentimentScores, ...props }: Props) => {
  const [search] = useSearchParams();

  const year = props.year || getYearFilter(search);
  const quarter = props.quarter || getQuarterFilter(search);

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
