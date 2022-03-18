import React from 'react';
import { ITextingCampaignData } from 'services/textingCampaigns';
import Button from 'components/UI/Button';
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
  gap: 10px;
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
  justify-content: flex-end;
  width: 344px;
  min-width: 344px;
`;

const DraftCampaignRow = ({ campaign }: Props) => (
  <Container id={campaign.id}>
    <Left>
      <TextWrapper>
        <Text>{campaign.attributes.body}</Text>
      </TextWrapper>
      <StatusLabel
        backgroundColor={colors.adminOrangeIcons}
        text={<FormattedMessage {...messages.draft} />}
      />
    </Left>
    <Right>
      <Button
        linkTo={`/admin/messaging/emails/custom/${campaign.id}`}
        buttonStyle="secondary"
        icon="edit"
      >
        <FormattedMessage {...messages.manageButtonLabel} />
      </Button>
    </Right>
  </Container>
);

export default DraftCampaignRow;
