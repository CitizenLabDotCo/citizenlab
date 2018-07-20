import * as React from 'react';
import { ICampaignData } from 'services/campaigns';

import PageWrapper from 'components/admin/PageWrapper';

import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import PreviewFrame from './PreviewFrame';

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
        <PreviewFrame campaignId={campaign.id} />
      </PageWrapper>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetCampaign id={inputProps.campaignId}>
    {campaign => isNilOrError(campaign) ? null : <SentCampaignDetails {...inputProps} campaign={campaign} />}
  </GetCampaign>
);
