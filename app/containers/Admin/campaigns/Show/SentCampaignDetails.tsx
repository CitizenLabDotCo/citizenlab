import * as React from 'react';
import { ICampaignData } from 'services/campaigns';

import PageWrapper from 'components/admin/PageWrapper';

import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import PreviewFrame from './PreviewFrame';
import RecipientsTable from './RecipientsTable';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledRecipientsTable = styled(RecipientsTable)`
  padding: 20px 0;
`;

interface InputProps {
  campaignId: string;
}

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps { }

class SentCampaignDetails extends React.Component<Props> {

  render() {
    const { campaign } = this.props;
    return (
      <PageWrapper>
        <h2><FormattedMessage {...messages.previewTitle} /></h2>
        <PreviewFrame campaignId={campaign.id} />
        <h2><FormattedMessage {...messages.recipientsTitle} /></h2>
        <StyledRecipientsTable campaignId={campaign.id} />
      </PageWrapper>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetCampaign id={inputProps.campaignId}>
    {campaign => isNilOrError(campaign) ? null : <SentCampaignDetails {...inputProps} campaign={campaign} />}
  </GetCampaign>
);
