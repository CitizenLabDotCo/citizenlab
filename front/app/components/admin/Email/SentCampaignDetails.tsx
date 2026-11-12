import * as React from 'react';
import { useState } from 'react';

import styled from 'styled-components';

import useEmailCampaignDeliveries from 'api/campaigns/email/deliveries/useEmailCampaignDeliveries';

import useLocale from 'hooks/useLocale';

import CampaignStats from 'components/admin/Email/CampaignStats';
import PreviewFrameWithLocaleSwitcher from 'components/admin/Email/PreviewFrameWithLocaleSwitcher';
import RecipientsTable from 'components/admin/Email/RecipientsTable';
import PageWrapper from 'components/admin/PageWrapper';

import { FormattedMessage } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from './messages';

const PaddedCampaignStats = styled(CampaignStats)`
  padding-bottom: 20px;
`;

const PaddedPreviewFrame = styled(PreviewFrameWithLocaleSwitcher)`
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
  const locale = useLocale();
  const [previewLocale, setPreviewLocale] = useState(locale);
  const { data: deliveries } = useEmailCampaignDeliveries({
    campaignId,
    pageNumber,
    pageSize: 10,
  });
  return (
    <PageWrapper>
      <PaddedCampaignStats campaignId={campaignId} />
      <PaddedPreviewFrame
        campaignId={campaignId}
        locale={previewLocale}
        onLocaleChange={setPreviewLocale}
      />
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
