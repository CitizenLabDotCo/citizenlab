import * as React from 'react';

import {
  Box,
  colors,
  fontSizes,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCampaign from 'api/campaigns/useCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';
import EditCampaignForm from '../EditCampaignForm';
import { CampaignFormValues } from 'api/campaigns/types';
import styled from 'styled-components';
import PreviewFrame from 'components/admin/Email/PreviewFrame';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
`;

const SendTestEmailButton = styled.button`
  text-decoration: underline;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;

const Edit = () => {
  const { campaignId } = useParams() as {
    campaignId: string;
  };
  const { data: campaign } = useCampaign(campaignId);
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();

  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();
  const { formatMessage } = useIntl();

  const handleSendPreviewEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        const previewSentConfirmation = formatMessage(
          messages.previewSentConfirmation
        );
        window.alert(previewSentConfirmation);
      },
    });
  };

  if (!campaign) {
    return null;
  }
  const handleSubmit = async (values: CampaignFormValues) => {
    await updateCampaign({ id: campaign.data.id, campaign: values });
  };

  const goBack = () => {
    clHistory.push(`/admin/messaging/emails/automated`);
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.editCampaignTitle} />
      </PageTitle>

      <Box display="flex">
        <Box mb="30px" display="flex" alignItems="center" width="50%">
          <EditCampaignForm
            isLoading={isLoading}
            onSubmit={handleSubmit}
            campaign={campaign}
            // campaignContextId={campaign.data.attributes.context_id}
          />
        </Box>
        <Box>
          <Box mb="30px" display="flex" alignItems="center" width="50%">
            <SendTestEmailButton
              onClick={handleSendPreviewEmail}
              disabled={isSendingCampaignPreview}
            >
              <FormattedMessage {...messages.sendTestEmailButton} />
            </SendTestEmailButton>
            &nbsp;
            <IconTooltip
              content={<FormattedMessage {...messages.sendTestEmailTooltip} />}
            />
          </Box>
          <PreviewFrame campaignId={campaign.data.id} showSubject={true} />
        </Box>
      </Box>
    </Box>
  );
};

export default Edit;
