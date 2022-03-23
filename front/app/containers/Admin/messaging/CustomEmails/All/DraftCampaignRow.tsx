import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ICampaignData } from 'services/campaigns';
import T from 'components/T';
import Button from 'components/UI/Button';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props {
  campaign: ICampaignData;
}

const Right = styled.div`
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
`;

const DraftCampaignRow = ({ campaign }: Props) => (
  <Row id={campaign.id}>
    <TextCell className="expand">
      <T value={campaign.attributes.subject_multiloc} />
    </TextCell>
    <StatusLabel
      minWidth="60px"
      backgroundColor={colors.clRedError}
      text={<FormattedMessage {...messages.draft} />}
    />
    <Right>
      <Button
        linkTo={`/admin/messaging/emails/custom/${campaign.id}`}
        width="86px"
        buttonStyle="secondary"
        icon="edit"
      >
        <FormattedMessage {...messages.manageButtonLabel} />
      </Button>
    </Right>
  </Row>
);

export default DraftCampaignRow;
