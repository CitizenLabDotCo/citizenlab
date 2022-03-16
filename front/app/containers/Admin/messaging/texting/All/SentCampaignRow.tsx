import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ITextingCampaignData } from 'services/textingCampaigns';
import T from 'components/T';
import { FormattedTime, FormattedDate } from 'react-intl';

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
      &nbsp;
      <FormattedTime value={campaign.attributes.sent_at} />
    </div>
    <div>
      <p>
        Sent to{' '}
        {campaign.attributes.phone_numbers.length.toLocaleString('en-US')}{' '}
        recipients
      </p>
    </div>
  </Row>
);

export default SentCampaignRow;
