import React from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useCommunityMonitorSentimentScores from 'api/community_monitor_scores/useCommunityMonitorSentimentScores';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import CategoryScores from './components/CategoryScores';
import HealthScoreChart from './components/HealthScoreChart';
import PreviousQuarterComparison from './components/PreviousQuarterComparison';
import TotalCountsSentimentBar from './components/TotalCountsSentimentBar';
import messages from './messages';
import {
  getQuarterFilter,
  getYearFilter,
  transformSentimentScoreData,
} from './utils';

type Props = {
  phaseId?: string;
};
const HealthScoreWidget = ({ phaseId }: Props) => {
  const locale = useLocale();
  const [search] = useSearchParams();
  const { formatMessage } = useIntl();
  const { data: communityMonitorSentimentScores } =
    useCommunityMonitorSentimentScores(phaseId);

  // Get current year/quarter filter
  const year = getYearFilter(search);
  const quarter = getQuarterFilter(search);

  // Transform the sentiment score data into a more usable format
  const sentimentScores = transformSentimentScoreData(
    communityMonitorSentimentScores?.data.attributes,
    locale
  );

  // const sentimentScores = {
  //   overallHealthScores: [
  //     {
  //       period: '2024-1',
  //       score: 2.1,
  //     },
  //     {
  //       period: '2024-2',
  //       score: 4.0,
  //     },
  //     {
  //       period: '2024-3',
  //       score: 3.0,
  //     },
  //     {
  //       period: '2024-4',
  //       score: 3.4,
  //     },
  //     {
  //       period: '2025-1',
  //       score: 4.3,
  //     },
  //   ],
  //   categoryHealthScores: [
  //     {
  //       category: 'quality_of_life',
  //       localizedLabel: 'Quality of life',
  //       scores: [
  //         {
  //           period: '2024-1',
  //           score: 1.5,
  //         },
  //         {
  //           period: '2024-2',
  //           score: 3.8,
  //         },
  //         {
  //           period: '2024-3',
  //           score: 2.0,
  //         },
  //         {
  //           period: '2024-4',
  //           score: 2.2,
  //         },
  //         {
  //           period: '2025-1',
  //           score: 3,
  //         },
  //       ],
  //     },
  //     {
  //       category: 'service_delivery',
  //       localizedLabel: 'Service delivery',
  //       scores: [
  //         {
  //           period: '2024-1',
  //           score: 2.9,
  //         },
  //         {
  //           period: '2024-2',
  //           score: 4.5,
  //         },
  //         {
  //           period: '2024-3',
  //           score: 3.1,
  //         },
  //         {
  //           period: '2024-4',
  //           score: 3,
  //         },
  //         {
  //           period: '2025-1',
  //           score: 3.5,
  //         },
  //       ],
  //     },
  //     {
  //       category: 'governance_and_trust',
  //       localizedLabel: 'Governance and trust',
  //       scores: [
  //         {
  //           period: '2024-1',
  //           score: 2.3,
  //         },
  //         {
  //           period: '2024-2',
  //           score: 4.9,
  //         },
  //         {
  //           period: '2024-3',
  //           score: 1.2,
  //         },
  //         {
  //           period: '2024-4',
  //           score: 2,
  //         },
  //         {
  //           period: '2025-1',
  //           score: 5,
  //         },
  //       ],
  //     },
  //   ],
  //   totalHealthScoreCounts: [
  //     {
  //       period: '2024-1',
  //       totals: [
  //         {
  //           sentimentValue: '1',
  //           count: 15,
  //         },
  //         {
  //           sentimentValue: '2',
  //           count: 3,
  //         },
  //         {
  //           sentimentValue: '3',
  //           count: 8,
  //         },
  //         {
  //           sentimentValue: '4',
  //           count: 12,
  //         },
  //         {
  //           sentimentValue: '5',
  //           count: 5,
  //         },
  //       ],
  //     },
  //     {
  //       period: '2024-2',
  //       totals: [
  //         {
  //           sentimentValue: '1',
  //           count: 7,
  //         },
  //         {
  //           sentimentValue: '2',
  //           count: 12,
  //         },
  //         {
  //           sentimentValue: '3',
  //           count: 15,
  //         },
  //         {
  //           sentimentValue: '4',
  //           count: 3,
  //         },
  //         {
  //           sentimentValue: '5',
  //           count: 9,
  //         },
  //       ],
  //     },
  //     {
  //       period: '2024-3',
  //       totals: [
  //         {
  //           sentimentValue: '1',
  //           count: 20,
  //         },
  //         {
  //           sentimentValue: '2',
  //           count: 2,
  //         },
  //         {
  //           sentimentValue: '3',
  //           count: 11,
  //         },
  //         {
  //           sentimentValue: '4',
  //           count: 5,
  //         },
  //         {
  //           sentimentValue: '5',
  //           count: 10,
  //         },
  //       ],
  //     },
  //     {
  //       period: '2024-4',
  //       totals: [
  //         {
  //           sentimentValue: '6',
  //           count: 11,
  //         },
  //         {
  //           sentimentValue: '3',
  //           count: 5,
  //         },
  //         {
  //           sentimentValue: '6',
  //           count: 4,
  //         },
  //         {
  //           sentimentValue: '3',
  //           count: 6,
  //         },
  //         {
  //           sentimentValue: '2',
  //           count: 16,
  //         },
  //       ],
  //     },
  //     {
  //       period: '2025-1',
  //       totals: [
  //         {
  //           sentimentValue: '1',
  //           count: 11,
  //         },
  //         {
  //           sentimentValue: '2',
  //           count: 5,
  //         },
  //         {
  //           sentimentValue: '3',
  //           count: 4,
  //         },
  //         {
  //           sentimentValue: '4',
  //           count: 6,
  //         },
  //         {
  //           sentimentValue: '5',
  //           count: 16,
  //         },
  //       ],
  //     },
  //   ],
  // };

  // Get the current overall health score
  const currentOverallHealthScore = sentimentScores?.overallHealthScores.find(
    (score) => score.period === `${year}-${quarter}`
  );

  return (
    <Box
      background={colors.white}
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.borderLight}`}
      p="24px"
      mb="16px"
    >
      <Box display="flex" gap="20px">
        <Box>
          <Box display="flex">
            <Icon my="auto" height="18px" name="dot" fill={colors.green400} />
            <Title m="0px" variant="h5" color="textPrimary">
              {formatMessage(messages.healthScore)}
            </Title>
          </Box>
          <Box display="flex" mt="12px" ml="8px">
            <Text
              m="0px"
              fontSize="xxxxl"
              mt="auto"
              fontWeight="bold"
              lineHeight="1"
              mr="4px"
              color={
                currentOverallHealthScore?.score ? 'textPrimary' : 'coolGrey300'
              }
            >
              {currentOverallHealthScore?.score || '?'}
            </Text>
            <Text
              fontWeight="semi-bold"
              m="0px"
              mt="auto"
              fontSize="xxl"
              lineHeight="1"
            >
              /5
            </Text>
          </Box>
          <Box mt="20px">
            <PreviousQuarterComparison sentimentScores={sentimentScores} />
            <TotalCountsSentimentBar sentimentScores={sentimentScores} />
          </Box>
        </Box>
        <Box minWidth="200px">
          <HealthScoreChart sentimentScores={sentimentScores} />
        </Box>
      </Box>
      <Box mt="20px">
        <CategoryScores sentimentScores={sentimentScores} />
      </Box>
    </Box>
  );
};

export default HealthScoreWidget;
