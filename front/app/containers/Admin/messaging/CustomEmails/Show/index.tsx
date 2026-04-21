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
import { useParams, useSearchParams } from 'react-router-dom';
import GetGroup from 'resources/GetGroup';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import { isDraft } from 'api/campaigns/util';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

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
import Link from 'utils/cl-router/Link';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { formatDateInTimezone } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import messages from '../../messages';

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

const GroupLink = styled.a`
  color: inherit;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
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
  const { campaignId } = useParams() as { campaignId: string };

  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useCampaign(campaignId);
  const { data: project } = useProjectById(
    campaign?.data.relationships.context?.data?.id
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const authorId = campaign?.data.relationships.author.data?.id;
  const { data: sender } = useUserById(authorId);

  const {
    mutate: sendCampaign,
    isLoading: isSendingCampaign,
    error: apiSendErrors,
  } = useSendCampaign();
  const { mutate: sendCampaignPreview, isLoading: isSenndingCampaignPreview } =
    useSendCampaignPreview();
  const [searchParams] = useSearchParams();
  const created = searchParams.get('created');
  const updated = searchParams.get('updated');
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
  const localize = useLocalize();
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

  const handleGroupLinkClick =
    (groupId?: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      if (groupId) {
        clHistory.push(`/admin/users/groups/${groupId}`);
      } else {
        clHistory.push('/admin/users');
      }
    };

  const getSenderName = (senderType: string) => {
    let senderName: string | null = null;

    if (senderType === 'author' && sender) {
      senderName = getFullName(sender.data);
    } else if (senderType === 'organization' && tenant) {
      senderName = localize(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        tenant?.data.attributes.settings.core.organization_name
      );
    }

    return senderName;
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
  const isEmailSchedulingAllowed = useFeatureFlag({
    name: 'email_scheduling',
  });
  const timeZone = tenant?.data.attributes.settings.core.timezone;

  if (campaign) {
    const groupIds: string[] = campaign.data.relationships.groups.data.map(
      (group) => group.id
    );
    const senderType = campaign.data.attributes.sender;
    const senderName = getSenderName(senderType);
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
            {isDraft(campaign.data) && (
              <StatusLabel
                backgroundColor={colors.brown}
                text={<FormattedMessage {...messages.draft} />}
              />
            )}
            {!isDraft(campaign.data) &&
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
                  {formatDateInTimezone({
                    date: campaign.data.attributes.scheduled_at,
                    timeZone,
                  })}
                </Text>
              </>
            )}
          </Box>
          {(isDraft(campaign.data) ||
            campaign.data.attributes.scheduled_at) && (
            <Buttons>
              <ButtonWithLink
                linkTo={`/admin/messaging/emails/custom/${campaign.data.id}/edit`}
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
                  borderRadius={
                    isEmailSchedulingAllowed ? '3px 0px 0px 3px' : '3px'
                  }
                >
                  <FormattedMessage {...messages.send} />
                </ButtonWithLink>
                {isEmailSchedulingAllowed && (
                  <EmailScheduling campaign={campaign} timeZone={timeZone} />
                )}
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
              {campaign.data.attributes.campaign_name ===
                'manual_project_participants' &&
                project && (
                  <span>
                    <FormattedMessage {...messages.allParticipantsInProject} />{' '}
                    <Link
                      to={`/admin/projects/${project.data.id}`}
                      target="_blank"
                    >
                      {localize(project.data.attributes.title_multiloc)}
                    </Link>
                  </span>
                )}
              {noGroupsSelected &&
                campaign.data.attributes.campaign_name === 'manual' && (
                  <GroupLink onClick={handleGroupLinkClick()}>
                    {formatMessage(messages.allUsers)}
                  </GroupLink>
                )}
              {groupIds.map((groupId, index) => (
                <GetGroup key={groupId} id={groupId}>
                  {(group) => {
                    if (index < groupIds.length - 1) {
                      return (
                        <GroupLink onClick={handleGroupLinkClick(groupId)}>
                          {!isNilOrError(group) &&
                            localize(group.attributes.title_multiloc)}
                          ,{' '}
                        </GroupLink>
                      );
                    }
                    return (
                      <GroupLink onClick={handleGroupLinkClick(groupId)}>
                        {!isNilOrError(group) &&
                          localize(group.attributes.title_multiloc)}
                      </GroupLink>
                    );
                  }}
                </GetGroup>
              ))}
            </div>
          </FromTo>
          {(isDraft(campaign.data) ||
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

        {isDraft(campaign.data) || campaign.data.attributes.scheduled_at ? (
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
                linkTo={`/admin/messaging/emails/custom/${campaign.data.id}/edit`}
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
