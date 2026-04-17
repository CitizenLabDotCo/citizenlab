import React, { useState } from 'react';

import {
  Box,
  Button,
  IconTooltip,
  colors,
  Success,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import PreviewFrame from 'components/admin/Email/PreviewFrame';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';
import messages from '../messages';

const Edit = () => {
  const { projectId, campaignId } = useParams() as {
    projectId: string;
    campaignId: string;
  };

  const { formatMessage } = useIntl();

  const { data: campaign } = useCampaign(campaignId);

  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();
  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();
  const [previewSent, setPreviewSent] = useState(false);
  const goBack = () => {
    clHistory.push(
      `/admin/projects/${projectId}/messaging/${campaign?.data.id}`
    );
  };

  if (!campaign) {
    return null;
  }
  const handleSendTestEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        setPreviewSent(true);
      },
    });
  };
  const handleSubmit = async (values: FormValues) => {
    await updateCampaign({ id: campaign.data.id, campaign: values });
    clHistory.push(
      `/admin/projects/${projectId}/messaging/${campaign.data.id}?updated=true`
    );
  };

  return (
    <Box p="44px">
      <Box background={colors.white} p="40px">
        <GoBackButton onClick={goBack} />
        <PageTitle>
          <FormattedMessage {...messages.editCampaignTitle} />
        </PageTitle>
        <Box>
          {previewSent && (
            <Box mb="8px">
              <Success
                text={formatMessage(messages.previewSentConfirmation)}
                showIcon
                showBackground
              />
            </Box>
          )}
        </Box>
        <Box display="flex">
          <Box width="50%" mr="36px">
            <CampaignForm
              isLoading={isLoading}
              onSubmit={handleSubmit}
              defaultValues={{
                sender: campaign.data.attributes.sender,
                reply_to: campaign.data.attributes.reply_to,
                subject_multiloc: campaign.data.attributes.subject_multiloc,
                body_multiloc: campaign.data.attributes.body_multiloc,
                isScheduled: campaign.data.attributes.scheduled_at !== null,
              }}
            />
          </Box>

          <Box width="50%">
            <Box display="inline-flex" width="100%" mb="12px">
              <Box width="70%">
                <h2>
                  <FormattedMessage {...messages.preview} />
                </h2>
              </Box>
              <Box>
                <Button
                  icon="send"
                  buttonStyle="secondary-outlined"
                  onClick={handleSendTestEmail}
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
              <PreviewFrame
                campaignId={campaign.data.id}
                showHeaders={true}
                height="740px"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Edit;
