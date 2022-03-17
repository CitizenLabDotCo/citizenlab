import React from 'react';
import { TextCell } from 'components/admin/ResourceList';
import { ITextingCampaignData } from 'services/textingCampaigns';
import T from 'components/T';
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
  width: 100%;
`;

const TextCellWrapper = styled.div`
  width: 80%;
  overflow-wrap: break-word;
`;

const Right = styled.div`
  width: 344px;
  min-width: 344px;
`;

const SendingCampaignRow = ({ campaign }: Props) => (
  <Container id={campaign.id}>
    <Left>
      <TextCellWrapper>
        <TextCell className="expand">
          <T value={campaign.attributes.body_multiloc} />
        </TextCell>
      </TextCellWrapper>
      <StatusLabel
        backgroundColor={colors.adminMenuBackground}
        text={<FormattedMessage {...messages.sending} />}
      />
    </Left>
    <Right />
  </Container>
);

export default SendingCampaignRow;
