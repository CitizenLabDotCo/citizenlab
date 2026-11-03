import React, { useEffect, useState } from 'react';

import {
  StatusLabel,
  IconTooltip,
  colors,
  Title,
  Box,
  fontSizes,
  Text,
  Button,
  Success,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useEmailCampaign from 'api/campaigns/email/useEmailCampaign';
import useSendEmailCampaign from 'api/campaigns/email/useSendEmailCampaign';
import useSendEmailCampaignPreview from 'api/campaigns/email/useSendEmailCampaignPreview';
import { isEmailCampaignDraft } from 'api/campaigns/email/util';

import DraftCampaignDetails from 'components/admin/Email/DraftCampaignDetails';
import EmailScheduling from 'components/admin/Email/Scheduling';
import SentCampaignDetails from 'components/admin/Email/SentCampaignDetails';
import Stamp from 'components/admin/Email/Stamp';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useParams, useSearch } from 'utils/router';

import messages from '../../messages';

import FromTo from './FromTo';

const StampIcon = styled(Stamp)`
  margin-right: 20px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  & > * {
    padding: 0 10px;
  }
  align-items: center;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;

  .Button {
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const SendNowWarning = styled.div`
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
`;
type FeedbackType = 'sent' | 'updated' | 'created' | null;
const Show = () => {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };

  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useEmailCampaign(campaignId);

  const {
    mutate: sendCampaign,
    isPending: isSendingCampaign,
    error: apiSendErrors,
  } = useSendEmailCampaign();
  const { mutate: sendCampaignPreview, isPending: isSenndingCampaignPreview } =
    useSendEmailCampaignPreview();
  const searchParams = useSearch({
    from: '/$locale/admin/messaging/emails/custom/$campaignId',
  });
  const created = searchParams.created;
  const updated = searchParams.updated;
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(
    created ? 'created' : updated ? 'updated' : null
  );
  useEffect(() => {
    if (created) removeSearchParams(['created']);
    if (updated) removeSearchParams(['updated']);
  }, [created, updated]);

  const feedbackMessages = {
    sent: messages.previewSentConfirmation,
    updated: messages.emailUpdated,
    created: messages.emailCreated,
  };
  const isLoading = isSendingCampaign || isSenndingCampaignPreview;
  const { formatMessage } = useIntl();

  const [showSendConfirmationModal, setShowSendConfirmationModal] =
    useState(false);

  const handleSend = (noGroupsSelected: boolean) => () => {
    if (
      noGroupsSelected &&
      campaign?.data.attributes.campaign_name === 'manual'
    ) {
      openSendConfirmationModal();
    } else {
      sendCampaign(campaignId);
    }
  };

  const handleSendTestEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        setFeedbackType('sent');
      },
    });
  };

  const openSendConfirmationModal = () => {
    setShowSendConfirmationModal(true);
  };

  const closeSendConfirmationModal = () => {
    setShowSendConfirmationModal(false);
  };

  const confirmSendCampaign = (campaignId: string) => () => {
    sendCampaign(campaignId, {
      onSuccess: () => {
        closeSendConfirmationModal();
      },
    });
  };
  const timeZone = tenant?.data.attributes.settings.core.timezone;

  if (campaign) {
    const groupIds: string[] = campaign.data.relationships.groups.data.map(
      (group) => group.id
    );
    const noGroupsSelected = groupIds.length === 0;

    const goBack = () => {
      clHistory.push(`/admin/messaging/emails/custom`);
    };

    return (
      <Box background={colors.white} p="40px" id="e2e-custom-email-container">
        <GoBackButton onClick={goBack} />
        <Box display="flex" mb="20px">
          <Box display="flex" alignItems="center" mr="auto" gap="12px">
            <Title mr="12px">
              <T value={campaign.data.attributes.subject_multiloc} />
            </Title>
            {isEmailCampaignDraft(campaign.data) && (
              <StatusLabel
                backgroundColor={colors.brown}
                text={<FormattedMessage {...messages.draft} />}
              />
            )}
            {!isEmailCampaignDraft(campaign.data) &&
              !campaign.data.attributes.scheduled_at && (
                <StatusLabel
                  backgroundColor={colors.success}
                  text={<FormattedMessage {...messages.sent} />}
                />
              )}
            {campaign.data.attributes.scheduled_at && timeZone && (
              <>
                <StatusLabel
                  backgroundColor={colors.teal500}
                  text={<FormattedMessage {...messages.scheduled} />}
                />
                <Text fontSize="base" whiteSpace="nowrap">
                  {moment(campaign.data.attributes.scheduled_at)
                    .tz(timeZone)
                    .format('LLL')}
                </Text>
              </>
            )}
          </Box>
          {(isEmailCampaignDraft(campaign.data) ||
            campaign.data.attributes.scheduled_at) && (
            <Buttons>
              <ButtonWithLink
                to="/admin/messaging/emails/custom/$campaignId/edit"
                params={{ campaignId: campaign.data.id }}
                buttonStyle="secondary-outlined"
              >
                <FormattedMessage {...messages.editButtonLabel} />
              </ButtonWithLink>

              <Box
                position="relative"
                display="flex"
                gap="1px"
                alignItems="center"
                maxHeight="90px"
              >
                <ButtonWithLink
                  buttonStyle="admin-dark"
                  icon="send"
                  iconPos="right"
                  onClick={handleSend(noGroupsSelected)}
                  disabled={isLoading}
                  processing={isLoading}
                  borderRadius={'3px 0px 0px 3px'}
                >
                  <FormattedMessage {...messages.send} />
                </ButtonWithLink>
                <EmailScheduling campaign={campaign} timeZone={timeZone} />
              </Box>
            </Buttons>
          )}
        </Box>
        {feedbackType && (
          <Box mb="8px">
            <Success
              text={formatMessage(feedbackMessages[feedbackType])}
              showIcon
              showBackground
            />
          </Box>
        )}
        {apiSendErrors && (
          <Box mb="8px">
            <Error apiErrors={apiSendErrors.errors['base']} />
          </Box>
        )}
        <Box
          display="flex"
          p="20px 0"
          borderTop={`1px solid ${colors.borderLight}`}
          borderBottom={`1px solid ${colors.borderLight}`}
          marginBottom="20px"
        >
          <StampIcon />
          <FromTo campaign={campaign} />
          {(isEmailCampaignDraft(campaign.data) ||
            campaign.data.attributes.scheduled_at) && (
            <Box>
              <Button
                icon="send"
                buttonStyle="secondary-outlined"
                onClick={handleSendTestEmail}
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
          )}
        </Box>

        {isEmailCampaignDraft(campaign.data) ||
        campaign.data.attributes.scheduled_at ? (
          <DraftCampaignDetails campaign={campaign.data} />
        ) : (
          <SentCampaignDetails campaignId={campaign.data.id} />
        )}

        <Modal
          opened={showSendConfirmationModal}
          close={closeSendConfirmationModal}
          header={<FormattedMessage {...messages.confirmSendHeader} />}
        >
          <Box p="30px">
            <SendNowWarning>
              <FormattedMessage {...messages.toAllUsers} />
            </SendNowWarning>
            <ButtonsWrapper>
              <ButtonWithLink
                buttonStyle="secondary-outlined"
                to="/admin/messaging/emails/custom/$campaignId/edit"
                params={{ campaignId: campaign.data.id }}
              >
                <FormattedMessage {...messages.changeRecipientsButton} />
              </ButtonWithLink>
              <ButtonWithLink
                buttonStyle="primary"
                onClick={confirmSendCampaign(campaign.data.id)}
                icon="send"
                iconPos="right"
                disabled={isLoading}
                processing={isLoading}
              >
                <FormattedMessage {...messages.sendNowButton} />
              </ButtonWithLink>
            </ButtonsWrapper>
          </Box>
        </Modal>
      </Box>
    );
  }

  return null;
};

export default Show;
