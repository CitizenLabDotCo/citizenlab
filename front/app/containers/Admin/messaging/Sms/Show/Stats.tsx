import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { FormattedNumber } from 'react-intl';
import styled from 'styled-components';

import { ISmsDeliveryStats } from 'api/campaigns/sms/stats/types';
import useSmsCampaignStats from 'api/campaigns/sms/stats/useSmsCampaignStats';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';

const Container = styled.div`
  display: flex;
  align-items: stretch;
  margin: 0px -5px;
  height: 130px;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  border: solid 1px ${colors.borderLight};
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.white};
  margin: 5px;
  justify-content: space-around;
  flex-grow: 1;
  align-items: center;
`;

const StatCardPercentage = styled.div`
  font-size: ${fontSizes.s}px;
  color: ${colors.textSecondary};
`;

const StatCardTitle = styled.h3`
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
  font-weight: 400;
  margin: 0;
`;

const StatCardCount = styled.div`
  font-size: ${fontSizes.xl}px;
`;

type Status = keyof Omit<ISmsDeliveryStats, 'total'>;

interface StatCardConfig {
  message: MessageDescriptor;
  statuses: Status[];
}

// Statuses grouped into cards, in funnel order; transient and failure statuses each collapse into one card.
const CARDS: StatCardConfig[] = [
  {
    message: messages.smsDeliveryStatus_pending,
    statuses: ['pending', 'queued'],
  },
  { message: messages.smsDeliveryStatus_sent, statuses: ['sent'] },
  { message: messages.smsDeliveryStatus_delivered, statuses: ['delivered'] },
  {
    message: messages.smsDeliveryStatus_failed,
    statuses: ['undelivered', 'failed', 'not_sent'],
  },
];

interface Props {
  campaignId: string;
  className?: string;
}

const Stats = ({ campaignId, className }: Props) => {
  const { data: stats } = useSmsCampaignStats(campaignId);

  if (!stats) return null;

  const { total } = stats.data.attributes;

  return (
    <Container className={className}>
      {CARDS.map(({ message, statuses }) => {
        const count = statuses.reduce(
          (sum, status) => sum + stats.data.attributes[status],
          0
        );
        const share = total > 0 ? count / total : 0;

        return (
          <StatCard key={message.id}>
            <StatCardPercentage>
              <FormattedNumber style="percent" value={share} />
            </StatCardPercentage>
            <StatCardCount>{count}</StatCardCount>
            <StatCardTitle>
              <FormattedMessage {...message} />
            </StatCardTitle>
          </StatCard>
        );
      })}
    </Container>
  );
};

export default Stats;
