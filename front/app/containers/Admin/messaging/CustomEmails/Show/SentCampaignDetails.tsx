import * as React from 'react';
import { useState } from 'react';

import styled from 'styled-components';

import useCampaignDeliveries from 'api/campaign_deliveries/useCampaignDeliveries';

import PageWrapper from 'components/admin/PageWrapper';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../../messages';

import CampaignStats from './CampaignStats';
import PreviewFrame from './PreviewFrame';
import RecipientsTable from './RecipientsTable';

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
  const [pageNumber, setPageNumber] = useState(1);
  const { data: deliveries } = useCampaignDeliveries({
    campaignId,
    pageNumber,
    pageSize: 10,
  });
  return (
    <PageWrapper>
      <PaddedCampaignStats campaignId={campaignId} />
      <PaddedPreviewFrame campaignId={campaignId} />
      <h2>
        <FormattedMessage {...messages.recipientsTitle} />
      </h2>
      {deliveries && (
        <PaddedRecipientsTable
          campaignId={campaignId}
          deliveries={deliveries.data}
          onChangePage={setPageNumber}
          currentPage={pageNumber}
          lastPage={getPageNumberFromUrl(deliveries.links.last) || 1}
        />
      )}
    </PageWrapper>
  );
};

export default SentCampaignDetails;
