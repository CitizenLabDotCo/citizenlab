import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

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

  // ToDo: Remove hard-coded data before releasing. Useful for testing now though.
  // const sentimentScores = {
  //   overallHealthScores: [
  //     { period: '2023-2', score: 2.8 },
  //     { period: '2023-3', score: 3.1 },
  //     { period: '2023-4', score: 3.5 },
  //     { period: '2024-1', score: 3.8 },
  //     { period: '2024-2', score: 4.5 },
  //     { period: '2024-3', score: 4.1 },
  //     { period: '2024-4', score: 5 },
  //     { period: '2025-1', score: 4 },
  //   ],
  //   categoryHealthScores: [
  //     {
  //       category: 'quality_of_life',
  //       localizedLabel: 'Quality of life',
  //       scores: [
  //         { period: '2023-2', score: 3.5 },
  //         { period: '2023-3', score: 3.8 },
  //         { period: '2023-4', score: 4.0 },
  //         { period: '2024-1', score: 4.2 },
  //         { period: '2024-2', score: 3.7 },
  //         { period: '2024-3', score: 3 },
  //         { period: '2024-4', score: 1 },
  //         { period: '2025-1', score: 5 },
  //       ],
  //     },
  //     {
  //       category: 'service_delivery',
  //       localizedLabel: 'Service delivery',
  //       scores: [
  //         { period: '2023-2', score: 2.5 },
  //         { period: '2023-3', score: 1.4 },
  //         { period: '2023-4', score: 3.0 },
  //         { period: '2024-1', score: 3.5 },
  //         { period: '2024-2', score: 2.8 },
  //         { period: '2024-3', score: 2 },
  //         { period: '2024-4', score: 2 },
  //         { period: '2025-1', score: 5 },
  //       ],
  //     },
  //     {
  //       category: 'governance_and_trust',
  //       localizedLabel: 'Governance and trust',
  //       scores: [
  //         { period: '2023-2', score: 5 },
  //         { period: '2023-3', score: 4.5 },
  //         { period: '2023-4', score: 4.3 },
  //         { period: '2024-1', score: 4.1 },
  //         { period: '2024-2', score: 3 },
  //         { period: '2024-3', score: 3.4 },
  //         { period: '2024-4', score: 2 },
  //         { period: '2025-1', score: 1 },
  //       ],
  //     },
  //   ],
  // };

  const timeSeries = sentimentScores?.overallHealthScores.map((score) => {
    const scoresForQuarter = {
      overall: score.score,
      quality_of_life: -1,
      service_delivery: -1,
      governance_and_trust: -1,
      quarter: score.period,
    };

    // Add in the scores for each category to the time series data
    sentimentScores.categoryHealthScores.forEach((category) => {
      const categoryScore = category.scores.find(
        (categoryScore) => categoryScore.period === score.period
      );

      if (categoryScore) {
        scoresForQuarter[category.category] = categoryScore.score;
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
    <Box>
      <Box height="160px" width="100%" minWidth="400px" maxWidth="800px">
        <LineChart
          width="100%"
          height="100%"
          data={timeSeries}
          mapping={{
            x: 'quarter',
            y: [
              'overall',
              'quality_of_life',
              'service_delivery',
              'governance_and_trust',
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
