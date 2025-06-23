import * as React from 'react';

import {
  Box,
  Button,
  colors,
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
import SuccessFeedback from 'components/HookForm/Feedback/SuccessFeedback';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
`;

const Edit = () => {
  const { campaignId } = useParams() as {
    campaignId: string;
  };
  const { data: campaign } = useCampaign(campaignId);
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();
  const [previewSent, setPreviewSent] = React.useState(false);

  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();
  const { formatMessage } = useIntl();

  const handleSendPreviewEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        setPreviewSent(true);
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
        <Box width="50%" mr="24px">
          <EditCampaignForm
            isLoading={isLoading}
            onSubmit={handleSubmit}
            campaign={campaign}
          />
        </Box>
        <Box width="50%">
          <Box display="inline-flex" width="100%" mb="12px">
            <Box width="70%">
              <h2>Preview</h2>
            </Box>
            <Box>
              <Button
                icon="send"
                buttonStyle="secondary-outlined"
                onClick={handleSendPreviewEmail}
                disabled={isSendingCampaignPreview}
                processing={isSendingCampaignPreview}
              >
                <Box display="inline-flex">
                  <FormattedMessage {...messages.sendTestEmailButton} />
                  <IconTooltip
                    mt="3px"
                    ml="4px"
                    content={
                      <FormattedMessage {...messages.sendTestEmailTooltip} />
                    }
                  />
                </Box>
              </Button>
            </Box>
          </Box>
          <Box>
            {previewSent && (
              <SuccessFeedback
                successMessage={formatMessage(messages.previewSentConfirmation)}
                closeSuccessMessage={() => setPreviewSent(false)}
              />
            )}
          </Box>
          <Box>
            <PreviewFrame campaignId={campaign.data.id} showHeaders={true} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Edit;
