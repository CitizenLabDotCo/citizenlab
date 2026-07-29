import React, { useEffect, useState } from 'react';

import {
  StatusLabel,
  IconTooltip,
  colors,
  Title,
  Box,
  fontSizes,
  Button,
  Text,
  Success,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { EmailCampaignFormValues } from 'api/campaigns/email/types';
import useEmailCampaign from 'api/campaigns/email/useEmailCampaign';
import useSendEmailCampaign from 'api/campaigns/email/useSendEmailCampaign';
import useSendEmailCampaignPreview from 'api/campaigns/email/useSendEmailCampaignPreview';
import useUpdateEmailCampaign from 'api/campaigns/email/useUpdateEmailCampaign';
import { isEmailCampaignDraft } from 'api/campaigns/email/util';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import DraftCampaignDetails from 'components/admin/Email/DraftCampaignDetails';
import EmailScheduling from 'components/admin/Email/Scheduling';
import SentCampaignDetails from 'components/admin/Email/SentCampaignDetails';
import Stamp from 'components/admin/Email/Stamp';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useParams, useSearch } from 'utils/router';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';

const StampIcon = styled(Stamp)`
  margin-right: 20px;
`;

const FromTo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: ${fontSizes.base}px;
  margin-right: auto;
`;

const FromToHeader = styled.span`
  font-weight: bold;
`;
const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  & > * {
    padding: 0 10px;
  }
  align-items: center;
`;
type FeedbackType = 'sent' | 'updated' | 'created' | null;
const Show = () => {
  const { projectId, campaignId } = useParams({ strict: false }) as {
    projectId: string;
    campaignId: string;
  };

  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useEmailCampaign(campaignId);
  const { data: project } = useProjectById(projectId);

  const {
    mutate: sendCampaign,
    isLoading: isSendingCampaign,
    error: apiSendErrors,
  } = useSendEmailCampaign();
  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendEmailCampaignPreview();
  const { mutate: updateCampaign, isLoading: isUpdatingCampaign } =
    useUpdateEmailCampaign();

  const { data: sender } = useUserById(
    campaign?.data.relationships.author.data.id
  );
  const isLoading =
    isSendingCampaign || isSendingCampaignPreview || isUpdatingCampaign;

  const searchParams = useSearch({
    from: '/$locale/admin/projects/$projectId/messaging/$campaignId',
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
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const handleSend = () => {
    // if the campaign is scheduled, we need to cancel the schedule ( send null ) before sending the campaign
    if (campaign?.data.attributes.scheduled_at) {
      updateCampaign({
        id: campaign.data.id,
        campaign: { scheduled_at: null } as EmailCampaignFormValues,
      });
    }
    sendCampaign(campaignId);
  };

  const handleSendTestEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        setFeedbackType('sent');
      },
    });
  };

  const getSenderName = (senderType: string) => {
    let senderName: string | null = null;

    if (senderType === 'author' && sender) {
      senderName = getFullName(sender.data);
    } else if (senderType === 'organization' && tenant) {
      senderName = localize(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        tenant?.data.attributes.settings.core.organization_name
      );
    }

    return senderName;
  };

  const timeZone = tenant?.data.attributes.settings.core.timezone;

  const hasNoParticipants =
    project?.data.attributes.participants_count === 0 &&
    campaign?.data.attributes.scheduled_at;

  if (campaign) {
    const senderType = campaign.data.attributes.sender;
    const senderName = getSenderName(senderType);
    return (
      <Box p="44px">
        <Box background={colors.white} p="40px" id="e2e-custom-email-container">
          <GoBackButton
            to="/admin/projects/$projectId/messaging"
            params={{ projectId }}
          />
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
                  to="/admin/projects/$projectId/messaging/$campaignId/edit"
                  params={{ projectId, campaignId: campaign.data.id }}
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
                  <Button
                    buttonStyle="admin-dark"
                    icon="send"
                    iconPos="right"
                    onClick={handleSend}
                    disabled={isLoading}
                    processing={isSendingCampaign}
                    borderRadius={'3px 0px 0px 3px'}
                  >
                    <FormattedMessage {...messages.send} />
                  </Button>
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
          {!apiSendErrors && hasNoParticipants && (
            <Box mb="8px">
              <Warning>{formatMessage(messages.no_recipients)}</Warning>
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
            <FromTo>
              <div>
                <FromToHeader>
                  <FormattedMessage {...messages.campaignFrom} />
                  &nbsp;
                </FromToHeader>
                <span>{senderName}</span>
              </div>
              <div>
                <FromToHeader>
                  <FormattedMessage {...messages.campaignTo} />
                  &nbsp;
                </FromToHeader>
                <span>
                  <FormattedMessage {...messages.projectParticipants} />
                </span>
              </div>
            </FromTo>
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
        </Box>
      </Box>
    );
  }

  return null;
};

export default Show;
