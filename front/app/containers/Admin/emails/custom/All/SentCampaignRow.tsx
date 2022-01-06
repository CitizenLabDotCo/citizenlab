import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ICampaignData } from 'services/campaigns';
import T from 'components/T';
import Button from 'components/UI/Button';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { FormattedDate, FormattedTime } from 'react-intl';

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
      backgroundColor="clGreenSuccess"
      text={<FormattedMessage {...messages.sent} />}
    />
    <Button
      linkTo={`/admin/emails/custom/${campaign.id}`}
      icon="charts"
      buttonStyle="text"
    >
      <FormattedMessage {...messages.statsButton} />
    </Button>
  </Row>
);

export default SentCampaignRow;
