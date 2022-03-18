import React from 'react';
import { ITextingCampaignData } from 'services/textingCampaigns';
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
`;

const Left = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const Text = styled.p`
  width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
`;

const Right = styled.div`
  width: 344px;
  min-width: 344px;
`;

const SendingCampaignRow = ({ campaign }: Props) => (
  <Container id={campaign.id}>
    <Left>
      <Text>{campaign.attributes.body}</Text>
      <StatusLabel
        backgroundColor={colors.adminMenuBackground}
        text={<FormattedMessage {...messages.sending} />}
      />
    </Left>
    <Right />
  </Container>
);

export default SendingCampaignRow;
