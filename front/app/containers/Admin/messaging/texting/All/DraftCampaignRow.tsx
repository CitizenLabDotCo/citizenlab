import React from 'react';
import { TextCell } from 'components/admin/ResourceList';
import { ITextingCampaignData } from 'services/textingCampaigns';
import T from 'components/T';
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
  display: flex;
  justify-content: flex-end;
  width: 344px;
  min-width: 344px;
`;

const DraftCampaignRow = ({ campaign }: Props) => (
  <Container id={campaign.id}>
    <Left>
      <TextCellWrapper>
        <TextCell className="expand">
          <T value={campaign.attributes.body_multiloc} />
        </TextCell>
      </TextCellWrapper>
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
