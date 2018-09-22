import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ICampaignData } from 'services/campaigns';
import T from 'components/T';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { FormattedDate, FormattedTime } from 'react-intl';
import StatusLabel from 'components/UI/StatusLabel';

interface Props {
  campaign: ICampaignData;
}

const SentCampaignRow = ({ campaign }: Props) => (
  <Row
    id={campaign.id}
  >
    <TextCell className="expand">
      <T value={campaign.attributes.subject_multiloc} />
    </TextCell>
    <div>
      <FormattedDate value={campaign.attributes.updated_at} />
      &nbsp;
      <FormattedTime value={campaign.attributes.updated_at} />
    </div>
    <StatusLabel color="clGreenSuccess" text={<FormattedMessage {...messages.sent} />} />
    <Button linkTo={`/admin/campaigns/${campaign.id}`} circularCorners={false} icon="analytics" style="secondary">
      <FormattedMessage {...messages.statsButton} />
    </Button>
  </Row>
);

export default SentCampaignRow;
