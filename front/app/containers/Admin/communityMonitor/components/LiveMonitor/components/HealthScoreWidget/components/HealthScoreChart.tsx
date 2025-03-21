import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import LineChart from 'components/admin/Graphs/LineChart';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { QuarterlyScores } from '../types';
import { categoryColors } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
};

const HealthScoreChart = ({ sentimentScores }: Props) => {
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');

  const timeSeries = sentimentScores?.overallHealthScores.map((score) => {
    // Create an object to hold the scores for the quarter
    const scoresForQuarter = {
      overall: score.score,
      quality_of_life: -1,
      service_delivery: -1,
      governance_and_trust: -1,
      other: -1,
      quarter: score.period,
    };

    // Add in the scores for each category to the scoresForQuarter data
    sentimentScores.categoryHealthScores.forEach((categoryScores) => {
      const categoryScore = categoryScores.scores.find(
        (categoryScore) => categoryScore.period === score.period
      );

      if (categoryScore) {
        scoresForQuarter[categoryScores.category] = categoryScore.score;
      }
    });

    return scoresForQuarter;
  });

  const lineConfig = {
    strokes: [
      categoryColors.overall,
      categoryColors.quality_of_life,
      categoryColors.service_delivery,
      categoryColors.governance_and_trust,
      categoryColors.other,
    ],
    r: 1,
  };

  const formatTick = (timePeriod: string) => {
    const year = timePeriod.split('-')[0];
    const quarter = timePeriod.split('-')[1];

    return formatMessage(messages.quarterChartLabel, {
      year,
      quarter,
    });
  };

  return (
    <Box flexGrow={1} ml={isMobileOrSmaller ? '-44px' : undefined}>
      <Box height="160px" width="100%" minWidth="300px" maxWidth="420px">
        <LineChart
          width="100%"
          height="100%"
          showEmptyGraph={true}
          data={timeSeries}
          mapping={{
            x: 'quarter',
            y: [
              'overall',
              'quality_of_life',
              'service_delivery',
              'governance_and_trust',
              'other',
            ],
          }}
          lines={lineConfig}
          grid={{ horizontal: true }}
          xaxis={{ tickFormatter: formatTick }}
          yaxis={{
            domain: [1, 5],
            tickFormatter: (value) => {
              return value.toString();
            },
            tickLine: true,
          }}
          innerRef={undefined}
        />
      </Box>
    </Box>
  );
};

export default HealthScoreChart;
