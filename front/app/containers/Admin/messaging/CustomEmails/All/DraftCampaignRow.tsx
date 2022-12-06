import React from 'react';
import { Box, StatusLabel } from '@citizenlab/cl2-component-library';
import { ICampaignData } from 'services/campaigns';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import T from 'components/T';
import Button from 'components/UI/Button';
import { Row, TextCell } from 'components/admin/ResourceList';
import messages from '../../messages';

interface Props {
  campaign: ICampaignData;
}

const DraftCampaignRow = ({ campaign }: Props) => (
  <Row id={campaign.id}>
    <TextCell className="expand">
      <T value={campaign.attributes.subject_multiloc} />
    </TextCell>
    <StatusLabel
      minWidth="94px"
      backgroundColor={colors.orange}
      text={<FormattedMessage {...messages.draft} />}
    />
    <Box minWidth="220px" display="flex" justifyContent="flex-end">
      <Button
        linkTo={`/admin/messaging/emails/custom/${campaign.id}`}
        buttonStyle="secondary"
        icon="edit"
      >
        <FormattedMessage {...messages.manageButtonLabel} />
      </Button>
    </Box>
  </Row>
);

export default DraftCampaignRow;
