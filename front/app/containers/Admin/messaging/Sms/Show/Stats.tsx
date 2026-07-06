import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { FormattedNumber } from 'react-intl';
import styled from 'styled-components';

import { ISmsDeliveryStats } from 'api/campaigns/sms/stats/types';
import useSmsCampaignStats from 'api/campaigns/sms/stats/useSmsCampaignStats';

import { FormattedMessage } from 'utils/cl-intl';

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

// The six delivery statuses, in funnel order. Displayed as one card each.
const STATUSES: (keyof Omit<ISmsDeliveryStats, 'total'>)[] = [
  'pending',
  'queued',
  'sent',
  'delivered',
  'undelivered',
  'failed',
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
      {STATUSES.map((status) => {
        const count = stats.data.attributes[status];
        const share = total > 0 ? count / total : 0;

        return (
          <StatCard key={status}>
            <StatCardPercentage>
              <FormattedNumber style="percent" value={share} />
            </StatCardPercentage>
            <StatCardCount>{count}</StatCardCount>
            <StatCardTitle>
              <FormattedMessage {...messages[`smsDeliveryStatus_${status}`]} />
            </StatCardTitle>
          </StatCard>
        );
      })}
    </Container>
  );
};

export default Stats;
