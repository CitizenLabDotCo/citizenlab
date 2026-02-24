import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  colors,
  IconTooltip,
  StatusLabel,
  Title,
} from '@citizenlab/cl2-component-library';
import { useSearch } from '@tanstack/react-router';

import { CampaignFormValues } from 'api/campaigns/types';
import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import AutomatedCampaignForm from 'containers/Admin/messaging/AutomatedEmails/CampaignForm';
import CustomCampaignForm from 'containers/Admin/messaging/CustomEmails/CampaignForm';
import messages from 'containers/Admin/messaging/messages';

import PreviewFrame from 'components/admin/Email/PreviewFrame';
import SuccessFeedback from 'components/HookForm/Feedback/SuccessFeedback';
import T from 'components/T';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useParams } from 'utils/router';

type EditProps = {
  campaignType: 'custom' | 'automated';
};

type FeedbackType = 'sent' | 'updated' | 'created' | null;

const feedbackMessages = {
  sent: messages.previewSentConfirmation,
  updated: messages.emailUpdated,
  created: messages.emailCreated,
};

const Edit = ({ campaignType }: EditProps) => {
  const { campaignId } = useParams({ strict: false }) as {
    campaignId: string;
  };
  const { data: campaign } = useCampaign(campaignId);
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();

  const { created } = useSearch({ strict: false });
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(
    created ? 'created' : null
  );

  useEffect(() => {
    if (created) removeSearchParams(['created']);
  }, [created]);

  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();
  const { formatMessage } = useIntl();

  const handleSendPreviewEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        setFeedbackType('sent');
      },
    });
  };

  if (!campaign) {
    return null;
  }

  const handleSubmit = async (values: CampaignFormValues) => {
    await updateCampaign({ id: campaign.data.id, campaign: values });
    setFeedbackType('updated');
  };

  const goBack = () => {
    clHistory.goBack();
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      {campaignType === 'custom' ? (
        <Box display="flex" alignItems="center">
          <Title mr="12px">
            <T value={campaign.data.attributes.subject_multiloc} />
          </Title>
          <StatusLabel
            backgroundColor={colors.brown}
            text={<FormattedMessage {...messages.draft} />}
          />
        </Box>
      ) : (
        <Title>
          <T value={campaign.data.attributes.campaign_description_multiloc} />
        </Title>
      )}
      <Box>
        {feedbackType && (
          <SuccessFeedback
            successMessage={formatMessage(feedbackMessages[feedbackType])}
            closeSuccessMessage={() => setFeedbackType(null)}
          />
        )}
      </Box>
      <Box display="flex">
        <Box width="50%" mr="36px">
          {campaignType === 'automated' ? (
            <AutomatedCampaignForm
              isLoading={isLoading}
              onSubmit={handleSubmit}
              campaign={campaign}
            />
          ) : (
            <CustomCampaignForm
              isLoading={isLoading}
              onSubmit={handleSubmit}
              campaignContextId={campaign.data.relationships.context?.data?.id}
              defaultValues={{
                sender: campaign.data.attributes.sender,
                reply_to: campaign.data.attributes.reply_to,
                subject_multiloc: campaign.data.attributes.subject_multiloc,
                body_multiloc: campaign.data.attributes.body_multiloc,
                group_ids: campaign.data.relationships.groups.data.map(
                  (d) => d.id
                ),
              }}
            />
          )}
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
            <PreviewFrame
              campaignId={campaign.data.id}
              showHeaders={true}
              height="740px"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Edit;
