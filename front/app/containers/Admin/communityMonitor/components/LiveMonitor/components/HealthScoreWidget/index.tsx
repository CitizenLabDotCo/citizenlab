import React from 'react';

import {
  Box,
  colors,
  Icon,
  IconTooltip,
  stylingConsts,
  Text,
  Title,
  useBreakpoint,
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
  categoryColors,
  filterDataBySelectedQuarter,
  getQuarterFilter,
  getYearFilter,
  transformSentimentScoreData,
} from './utils';

type Props = {
  phaseId?: string;
  quarter?: string;
  year?: string;
};
const HealthScoreWidget = ({ phaseId, ...props }: Props) => {
  const locale = useLocale();
  const [search] = useSearchParams();
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');

  const { data: communityMonitorSentimentScores } =
    useCommunityMonitorSentimentScores(phaseId);

  // Get current year/quarter filter
  const year = props.year || getYearFilter(search);
  const quarter = props.quarter || getQuarterFilter(search);

  // Transform the sentiment score data into a more usable format
  const sentimentScores = filterDataBySelectedQuarter(
    transformSentimentScoreData(
      communityMonitorSentimentScores?.data.attributes,
      locale
    ),
    year,
    quarter
  );

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
      <Box
        display="flex"
        flexDirection={isMobileOrSmaller ? 'column' : 'row'}
        gap="20px"
        id="e2e-health-score-widget"
      >
        <Box>
          <Box display="flex" alignItems="center">
            <Icon
              my="auto"
              height="18px"
              name="dot"
              fill={categoryColors['overall']}
            />
            <Title m="0px" variant="h5" color="textPrimary">
              {formatMessage(messages.healthScore)}
            </Title>
            <IconTooltip
              ml="4px"
              iconSize="16px"
              icon="info-outline"
              content={formatMessage(messages.healthScoreDescription)}
            />
          </Box>
          <Box display="flex" mt="12px" ml="8px">
            <Text
              m="0px"
              fontSize="xxxxl"
              mt="auto"
              fontWeight="bold"
              lineHeight="1"
              mr="4px"
              color={'textPrimary'}
            >
              {currentOverallHealthScore?.score || '-'}
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
            <PreviousQuarterComparison
              sentimentScores={sentimentScores}
              year={year}
              quarter={quarter}
            />
            <TotalCountsSentimentBar
              sentimentScores={sentimentScores}
              year={year}
              quarter={quarter}
            />
          </Box>
        </Box>
        <HealthScoreChart sentimentScores={sentimentScores} />
      </Box>
      <Box mt="20px">
        <CategoryScores
          sentimentScores={sentimentScores}
          year={year}
          quarter={quarter}
        />
      </Box>
    </Box>
  );
};

export default HealthScoreWidget;
