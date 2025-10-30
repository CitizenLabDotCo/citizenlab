import React from 'react';

import { Box, Title, Text } from 'component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const MetricCard = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 4px;
  padding: 24px;
`;

const MetricValue = styled.div`
  font-size: 36px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 8px;
`;

const MetricLabel = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface Props {
  phase?: IPhaseData;
}

const ParticipationMetrics = ({ phase: _phase }: Props) => {
  const dummyParticipants = Math.floor(Math.random() * 500) + 50;
  const dummyInputs = Math.floor(Math.random() * 300) + 20;

  return (
    <Box>
      <Title variant="h3" mb="16px">
        <FormattedMessage {...messages.participationMetricsTitle} />
      </Title>

      <Box display="flex" gap="16px" flexWrap="wrap">
        <MetricCard flex="1" minWidth="200px">
          <MetricLabel>
            <FormattedMessage {...messages.totalParticipants} />
          </MetricLabel>
          <MetricValue>{dummyParticipants}</MetricValue>
        </MetricCard>

        <MetricCard flex="1" minWidth="200px">
          <MetricLabel>Total Inputs</MetricLabel>
          <MetricValue>{dummyInputs}</MetricValue>
        </MetricCard>

        <MetricCard flex="1" minWidth="200px">
          <MetricLabel>Completion Rate</MetricLabel>
          <MetricValue>{Math.floor(Math.random() * 30) + 60}%</MetricValue>
        </MetricCard>
      </Box>
    </Box>
  );
};

export default ParticipationMetrics;
