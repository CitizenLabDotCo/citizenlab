import * as React from 'react';

import {
  colors,
  fontSizes,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { FormattedNumber } from 'react-intl';
import styled from 'styled-components';

import useCampaignStats from 'api/campaign_stats/useCampaignStats';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: stretch;
  margin: 0px -5px;
  height: 130px;
`;

const GraphCard = styled.div`
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

const GraphCardPercentage = styled.div`
  font-size: ${fontSizes.s}px;
  color: ${colors.textSecondary};
`;

const GraphCardTitle = styled.h3`
  display: flex;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
  font-weight: 400;
  margin: 0;

  & > :not(last-child) {
    margin-right: 7px;
  }
`;

const GraphCardCount = styled.div`
  font-size: ${fontSizes.xl}px;
`;

type Props = {
  campaignId: string;
  className?: string;
};

type IRelevantStats = 'sent' | 'delivered' | 'opened' | 'clicked';

const CampaignStats = ({ campaignId, className }: Props) => {
  const { data: stats } = useCampaignStats(campaignId);
  const relevantsStats = [
    'sent',
    'delivered',
    'opened',
    'clicked',
  ] as IRelevantStats[];

  if (!stats) return null;

  return (
    <Container className={className}>
      <GraphCard key="failed">
        <GraphCardPercentage>
          <FormattedNumber
            style="percent"
            value={
              (stats.data.attributes.failed + stats.data.attributes.bounced) /
              stats.data.attributes.total
            }
          />
        </GraphCardPercentage>
        <GraphCardCount>
          {stats.data.attributes.failed + stats.data.attributes.bounced}
        </GraphCardCount>
        <GraphCardTitle>
          <FormattedMessage {...messages.deliveryStatus_failed} />
        </GraphCardTitle>
      </GraphCard>
      {relevantsStats.map((status) => (
        <GraphCard key={status}>
          <GraphCardPercentage>
            {stats.data.attributes[status]}
          </GraphCardPercentage>
          <GraphCardCount>
            <FormattedNumber
              style="percent"
              value={
                stats.data.attributes[status] / stats.data.attributes.total
              }
            />
          </GraphCardCount>
          <GraphCardTitle>
            <FormattedMessage {...messages[`deliveryStatus_${status}`]} />
            {status === 'clicked' && (
              <IconTooltip
                content={
                  <FormattedMessage
                    {...messages.deliveryStatus_clickedTooltip}
                  />
                }
              />
            )}
          </GraphCardTitle>
        </GraphCard>
      ))}
    </Container>
  );
};

export default CampaignStats;
