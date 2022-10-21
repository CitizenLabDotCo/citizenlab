import { Box, StatusLabel } from '@citizenlab/cl2-component-library';
import { Row, TextCell } from 'components/admin/ResourceList';
import T from 'components/T';
import Button from 'components/UI/Button';
import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import { ICampaignData } from 'services/campaigns';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import messages from '../../messages';

interface Props {
  campaign: ICampaignData;
}

const SentCampaignRow = ({ campaign }: Props) => (
  <Row id={campaign.id}>
    <TextCell className="expand">
      <T value={campaign.attributes.subject_multiloc} />
    </TextCell>
    <div>
      <FormattedDate value={campaign.attributes.updated_at} />
      &nbsp;
      <FormattedTime value={campaign.attributes.updated_at} />
    </div>
    <StatusLabel
      minWidth="94px"
      backgroundColor={colors.success}
      text={<FormattedMessage {...messages.sent} />}
    />
    <Box minWidth="220px" display="flex" justifyContent="flex-end">
      <Button
        linkTo={`/admin/messaging/emails/custom/${campaign.id}`}
        icon="chart-bar"
        buttonStyle="text"
      >
        <FormattedMessage {...messages.statsButton} />
      </Button>
    </Box>
  </Row>
);

export default SentCampaignRow;
