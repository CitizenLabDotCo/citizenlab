import React from 'react';
import { Row, TextCell } from 'components/admin/ResourceList';
import { ITextingCampaignData } from 'services/textingCampaigns';
import T from 'components/T';
import { FormattedTime, FormattedDate } from 'react-intl';
import styled from 'styled-components';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { colors } from 'utils/styleUtils';

interface Props {
  campaign: ITextingCampaignData;
}

const StatusWrapper = styled.div``;

const SentCampaignRow = ({ campaign }: Props) => (
  <Row id={campaign.id}>
    <TextCell className="expand">
      <T value={campaign.attributes.body_multiloc} />
    </TextCell>
    <StatusLabel
      backgroundColor={colors.clGreenSuccess}
      text={<FormattedMessage {...messages.sent} />}
    />
    <div>
      <FormattedDate value={campaign.attributes.sent_at} />
      &nbsp;
      <FormattedTime value={campaign.attributes.sent_at} />
    </div>
    <StatusWrapper>
      <p>
        Sent to{' '}
        {campaign.attributes.phone_numbers.length.toLocaleString('en-US')}{' '}
        recipients
      </p>
    </StatusWrapper>
  </Row>
);

export default SentCampaignRow;
