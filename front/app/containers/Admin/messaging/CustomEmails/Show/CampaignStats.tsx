import * as React from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import GetCampaignStats from 'resources/GetCampaignStats';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedNumber } from 'react-intl';
import { IconTooltip } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  display: flex;
  align-items: stretch;
  margin: 0px -5px;
  height: 130px;
`;

const GraphCard = styled.div`
  display: flex;
  flex-direction: column;
  border: solid 1px ${colors.adminBorder};
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.adminContentBackground};
  margin: 5px;
  justify-content: space-around;
  flex-grow: 1;
  align-items: center;
`;

const GraphCardPercentage = styled.div`
  font-size: ${fontSizes.small};
  color: ${colors.adminSecondaryTextColor};
`;

const GraphCardTitle = styled.h3`
  display: flex;
  font-size: ${fontSizes.large}px;
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  margin: 0;

  & > :not(last-child) {
    margin-right: 7px;
  }
`;

const GraphCardCount = styled.div`
  font-size: ${fontSizes.xl}px;
`;

type InputProps = {
  campaignId: string;
  className?: string;
};

type DataProps = {
  stats: any;
};

type IRelevantStats = 'sent' | 'delivered' | 'opened' | 'clicked';

type Props = InputProps & DataProps;

interface State {}

class CampaignStats extends React.Component<Props, State> {
  relevantsStats = [
    'sent',
    'delivered',
    'opened',
    'clicked',
  ] as IRelevantStats[];

  render() {
    const { stats, className } = this.props;
    if (isNilOrError(stats)) return null;

    return (
      <Container className={className}>
        <GraphCard key="failed">
          <GraphCardPercentage>
            <FormattedNumber
              style="percent"
              value={(stats.failed + stats.bounced) / stats['total']}
            />
          </GraphCardPercentage>
          <GraphCardCount>{stats.failed + stats.bounced}</GraphCardCount>
          <GraphCardTitle>
            <FormattedMessage {...messages.deliveryStatus_failed} />
          </GraphCardTitle>
        </GraphCard>
        {this.relevantsStats.map((status) => (
          <GraphCard key={status}>
            <GraphCardPercentage>{stats[status]}</GraphCardPercentage>
            <GraphCardCount>
              <FormattedNumber
                style="percent"
                value={stats[status] / stats['total']}
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
  }
}

export default (inputProps: InputProps) => (
  <GetCampaignStats campaignId={inputProps.campaignId}>
    {(stats) => <CampaignStats {...inputProps} stats={stats} />}
  </GetCampaignStats>
);
