import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ITextingCampaignData } from 'services/textingCampaigns';
import T from 'components/T';
import Button from 'components/UI/Button';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { FormattedDate } from 'react-intl';

interface Props {
  campaign: ITextingCampaignData;
}

const SentCampaignRow = ({ campaign }: Props) => (
  <Row id={campaign.id}>
    <TextCell className="expand">
      <T value={campaign.attributes.body_multiloc} />
    </TextCell>
    <div>
      <FormattedDate value={campaign.attributes.sent_at} />
    </div>
    <StatusLabel
      backgroundColor="clGreenSuccess"
      text={<FormattedMessage {...messages.sent} />}
    />
    <Button
      linkTo={`/admin/messaging/emails/custom/${campaign.id}`}
      icon="charts"
      buttonStyle="text"
    >
      <FormattedMessage {...messages.statsButton} />
    </Button>
  </Row>
);

export default SentCampaignRow;
