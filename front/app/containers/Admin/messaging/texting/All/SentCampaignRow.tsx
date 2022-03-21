import React from 'react';
import { ITextingCampaignData } from 'services/textingCampaigns';
import { FormattedTime, FormattedDate } from 'react-intl';
import styled from 'styled-components';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { colors } from 'utils/styleUtils';

interface Props {
  campaign: ITextingCampaignData;
}

const Container = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-color: #e0e0e0 !important;
  border-top: 1px solid;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const TextWrapper = styled.div`
  line-height: 50px;
`;

const Text = styled.p`
  width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
`;

const Right = styled.div`
  display: flex;
  gap: 30px;
`;

// 140px is sufficient for longest date-time string
const DateTime = styled.div`
  width: 140px;
`;

// 174px is sufficient for 999,999 recipients
const StatusWrapper = styled.div`
  width: 174px;
  text-align: right;
`;

const SentCampaignRow = ({ campaign }: Props) => (
  <Container id={campaign.id}>
    <Left>
      <TextWrapper>
        <Text>{campaign.attributes.body}</Text>
      </TextWrapper>
      <StatusLabel
        backgroundColor={colors.clGreenSuccess}
        text={<FormattedMessage {...messages.sent} />}
      />
    </Left>
    <Right>
      <DateTime>
        <FormattedDate value={campaign.attributes.sent_at} />
        &nbsp;
        <FormattedTime value={campaign.attributes.sent_at} />
      </DateTime>
      <StatusWrapper>
        <p>
          Sent to{' '}
          {campaign.attributes.phone_numbers.length.toLocaleString('en-US')}{' '}
          recipients
        </p>
      </StatusWrapper>
    </Right>
  </Container>
);

export default SentCampaignRow;
