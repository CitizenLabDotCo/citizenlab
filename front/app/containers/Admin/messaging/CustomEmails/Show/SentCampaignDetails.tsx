import * as React from 'react';
import styled from 'styled-components';

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

interface Props {
  campaignId: string;
}

const SentCampaignDetails = ({ campaignId }: Props) => {
  return (
    <PageWrapper>
      <PaddedCampaignStats campaignId={campaignId} />
      <PaddedPreviewFrame campaignId={campaignId} />
      <h2>
        <FormattedMessage {...messages.recipientsTitle} />
      </h2>
      <PaddedRecipientsTable campaignId={campaignId} />
    </PageWrapper>
  );
};

export default SentCampaignDetails;
