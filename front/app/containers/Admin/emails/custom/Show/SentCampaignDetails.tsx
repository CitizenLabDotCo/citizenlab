import * as React from 'react';
import styled from 'styled-components';

import { ICampaignData } from 'services/campaigns';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';

import PageWrapper from 'components/admin/PageWrapper';
import CampaignStats from './CampaignStats';
import PreviewFrame from './PreviewFrame';
import RecipientsTable from './RecipientsTable';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const PaddedCampaignStats = styled(CampaignStats)`
  padding-bottom: 20px;
`;

const PaddedPreviewFrame = styled(PreviewFrame)`
  padding-bottom: 20px;
`;

const PaddedRecipientsTable = styled(RecipientsTable)`
  padding-bottom: 20px;
`;

interface InputProps {
  campaignId: string;
}

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps {}

class SentCampaignDetails extends React.Component<Props> {
  render() {
    const { campaign } = this.props;
    return (
      <PageWrapper>
        <PaddedCampaignStats campaignId={campaign.id} />
        <PaddedPreviewFrame campaignId={campaign.id} />
        <h2>
          <FormattedMessage {...messages.recipientsTitle} />
        </h2>
        <PaddedRecipientsTable campaignId={campaign.id} />
      </PageWrapper>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetCampaign id={inputProps.campaignId}>
    {(campaign) =>
      isNilOrError(campaign) ? null : (
        <SentCampaignDetails {...inputProps} campaign={campaign} />
      )
    }
  </GetCampaign>
);
