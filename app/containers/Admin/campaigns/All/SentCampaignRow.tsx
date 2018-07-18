import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ICampaignData } from 'services/campaigns';
import T from 'components/T';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { FormattedDate, FormattedTime } from 'react-intl';

interface Props {
  campaign: ICampaignData;
}

const SentCampaignRow = ({ campaign }: Props) => (
  <Row
    key={campaign.id}
    id={campaign.id}
  >
    <TextCell className="expand">
      <T value={campaign.attributes.subject_multiloc} />
    </TextCell>
    <div>
      <FormattedDate value={campaign.attributes.sent_at} />
      &nbsp;
      <FormattedTime value={campaign.attributes.sent_at} />
    </div>
    <Button linkTo={`/admin/campaigns/${campaign.id}`} style="text" circularCorners={false} icon="search">
      <FormattedMessage {...messages.showButtonLabel} />
    </Button>
  </Row>
);

export default SentCampaignRow;
