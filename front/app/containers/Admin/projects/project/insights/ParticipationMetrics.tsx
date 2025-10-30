import React from 'react';

import { Box, Title, Text } from 'component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { useParticipationMetrics } from './hooks/useParticipationMetrics';
import messages from './messages';
import MetricCard from './widgets/MetricCard';

const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const BreakdownGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

interface Props {
  phase: IPhaseData;
}

const ParticipationMetrics = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const metrics = useParticipationMetrics(phase);

  return (
    <Box>
      <Title variant="h3" mb="8px">
        <FormattedMessage {...messages.participationMetricsTitle} />
      </Title>
      <Text color="textSecondary" mb="24px">
        <FormattedMessage {...messages.participationMetricsDescription} />
      </Text>

      <GridContainer>
        <MetricCard
          value={metrics.uniqueParticipants}
          label={formatMessage(messages.uniqueParticipants)}
          subtext={formatMessage(messages.uniqueParticipantsSubtext)}
        />

        {metrics.totalContributions > 0 && (
          <MetricCard
            value={metrics.totalContributions}
            label={formatMessage(messages.totalContributions)}
            subtext={formatMessage(messages.totalContributionsSubtext)}
          />
        )}

        <MetricCard
          value={`${metrics.engagementRate.toFixed(1)}%`}
          label={formatMessage(messages.engagementRate)}
          subtext={formatMessage(messages.engagementRateSubtext, {
            visitors: metrics.totalVisitors,
          })}
        />
      </GridContainer>

      {metrics.contributionsByType && (
        <Box mt="24px">
          <Title variant="h4" mb="16px">
            <FormattedMessage {...messages.contributionBreakdown} />
          </Title>
          <BreakdownGrid>
            {Object.entries(metrics.contributionsByType).map(
              ([type, count]) => (
                <MetricCard
                  key={type}
                  value={count}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                />
              )
            )}
          </BreakdownGrid>
        </Box>
      )}
    </Box>
  );
};

export default ParticipationMetrics;
