import * as React from 'react';
import { useState } from 'react';

import {
  StatusLabel,
  IconTooltip,
  colors,
  Title,
  Box,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import GetGroup from 'resources/GetGroup';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import { isDraft } from 'api/campaigns/util';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import DraftCampaignDetails from 'components/admin/Email/DraftCampaignDetails';
import SentCampaignDetails from 'components/admin/Email/SentCampaignDetails';
import Stamp from 'components/admin/Email/Stamp';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
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

const SendTestEmailButton = styled.button`
  text-decoration: underline;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  & > * {
    padding: 0 10px;
  }
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

const Show = () => {
  const { campaignId } = useParams() as { campaignId: string };

  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useCampaign(campaignId);
  const { data: project } = useProjectById(
    campaign?.data.attributes.context_id
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
        const previewSentConfirmation = formatMessage(
          messages.previewSentConfirmation
        );
        window.alert(previewSentConfirmation);
      },
    });
  };

  const handleGroupLinkClick =
    (groupId?: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();
      if (groupId) {
        clHistory.push(`/admin/users/${groupId}`);
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

  if (campaign) {
    const groupIds: string[] = campaign.data.relationships.groups.data.map(
      (group) => group.id
    );
    const senderType = campaign.data.attributes.sender;
    const senderName = getSenderName(senderType);
    const noGroupsSelected = groupIds.length === 0;

    return (
      <Box background={colors.white} p="40px" id="e2e-custom-email-container">
        <Box display="flex" mb="20px">
          <Box display="flex" alignItems="center" mr="auto">
            <Title mr="12px">
              <T value={campaign.data.attributes.subject_multiloc} />
            </Title>
            {isDraft(campaign.data) ? (
              <StatusLabel
                backgroundColor={colors.brown}
                text={<FormattedMessage {...messages.draft} />}
              />
            ) : (
              <StatusLabel
                backgroundColor={colors.success}
                text={<FormattedMessage {...messages.sent} />}
              />
            )}
          </Box>
          {isDraft(campaign.data) && (
            <Buttons>
              <ButtonWithLink
                linkTo={`/admin/messaging/emails/custom/${campaign.data.id}/edit`}
                buttonStyle="secondary-outlined"
              >
                <FormattedMessage {...messages.editButtonLabel} />
              </ButtonWithLink>
              <ButtonWithLink
                buttonStyle="admin-dark"
                icon="send"
                iconPos="right"
                onClick={handleSend(noGroupsSelected)}
                disabled={isLoading}
                processing={isLoading}
              >
                <FormattedMessage {...messages.send} />
              </ButtonWithLink>
            </Buttons>
          )}
        </Box>
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
          {isDraft(campaign.data) && (
            <Box mb="30px" display="flex" alignItems="center">
              <SendTestEmailButton onClick={handleSendTestEmail}>
                <FormattedMessage {...messages.sendTestEmailButton} />
              </SendTestEmailButton>
              &nbsp;
              <IconTooltip
                content={
                  <FormattedMessage {...messages.sendTestEmailTooltip} />
                }
              />
            </Box>
          )}
        </Box>

        {isDraft(campaign.data) ? (
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
