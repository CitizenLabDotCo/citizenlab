import * as React from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';

import { sendCampaign, sendCampaignPreview, isDraft } from 'services/campaigns';
import GetGroup from 'resources/GetGroup';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../messages';

// components
import Button from 'components/UI/Button';
import {
  StatusLabel,
  IconTooltip,
  colors,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import DraftCampaignDetails from './DraftCampaignDetails';
import SentCampaignDetails from './SentCampaignDetails';
import T from 'components/T';
import Modal from 'components/UI/Modal';
import Stamp from './Stamp';

// utils
import { isNil, isNilOrError } from 'utils/helperUtils';

// styling
import { fontSizes } from 'utils/styleUtils';
import { useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'api/app_configuration/__mocks__/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import { useParams } from 'react-router-dom';
import useCampaign from 'api/campaigns/useCampaign';

const PageHeader = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const CampaignHeader = styled.div`
  display: flex;
  padding: 20px 0;
  border-top: 1px solid #d8d8d8;
  border-bottom: 1px solid #d8d8d8;
  margin-bottom: 20px;
`;

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
const StyledButtonContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  align-items: center;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
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

const ModalContainer = styled.div`
  padding: 30px;
`;

const SendNowWarning = styled.div`
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
`;

const Show = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const [isCampaignSending, setIsCampaignSending] = useState(false);
  const [showSendConfirmationModal, setShowSendConfirmationModal] =
    useState(false);

  const appConfiguration = useAppConfiguration();
  const user = useAuthUser();
  const { campaignId } = useParams();
  const { data: { data: campaign } = {} } = useCampaign(campaignId);
  if (isNil(campaign)) return null;

  const handleSend = (noGroupsSelected: boolean) => () => {
    if (noGroupsSelected) {
      openSendConfirmationModal();
    } else {
      setIsCampaignSending(true);
      sendCampaign(campaign.id);
    }
  };

  const handleSendTestEmail = () => {
    sendCampaignPreview(campaign.id).then(() => {
      const previewSentConfirmation = formatMessage(
        messages.previewSentConfirmation
      );
      window.alert(previewSentConfirmation);
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

    if (senderType === 'author' && !isNilOrError(user)) {
      senderName = `${user.attributes.first_name} ${user.attributes.last_name}`;
    } else if (senderType === 'organization') {
      senderName = localize(
        appConfiguration.data.data.attributes.settings.core.organization_name
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
    setIsCampaignSending(true);
    sendCampaign(campaignId).then(() => {
      closeSendConfirmationModal();
    });
  };

  if (campaign) {
    const groupIds: string[] = campaign.relationships.groups.data.map(
      (group) => group.id
    );
    const senderType = campaign.attributes.sender;
    const senderName = getSenderName(senderType);
    const noGroupsSelected = groupIds.length === 0;

    return (
      <Box background={colors.white} p="40px" id="e2e-custom-email-container">
        <PageHeader>
          <PageTitleWrapper>
            <Title mr="12px">
              <T value={campaign.attributes.subject_multiloc} />
            </Title>
            {isDraft(campaign) ? (
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
          </PageTitleWrapper>
          {isDraft(campaign) && (
            <Buttons>
              <Button
                linkTo={`/admin/messaging/emails/custom/${campaign.id}/edit`}
                buttonStyle="secondary"
              >
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>
              <Button
                buttonStyle="admin-dark"
                icon="send"
                iconPos="right"
                onClick={handleSend(noGroupsSelected)}
                disabled={isCampaignSending}
                processing={isCampaignSending}
              >
                <FormattedMessage {...messages.send} />
              </Button>
            </Buttons>
          )}
        </PageHeader>
        <CampaignHeader>
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
              {noGroupsSelected && (
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
          {isDraft(campaign) && (
            <StyledButtonContainer>
              <SendTestEmailButton onClick={handleSendTestEmail}>
                <FormattedMessage {...messages.sendTestEmailButton} />
              </SendTestEmailButton>
              &nbsp;
              <IconTooltip
                content={
                  <FormattedMessage {...messages.sendTestEmailTooltip} />
                }
              />
            </StyledButtonContainer>
          )}
        </CampaignHeader>

        {isDraft(campaign) ? (
          <DraftCampaignDetails campaignId={campaign.id} />
        ) : (
          <SentCampaignDetails campaignId={campaign.id} />
        )}

        <Modal
          opened={showSendConfirmationModal}
          close={closeSendConfirmationModal}
          header={<FormattedMessage {...messages.confirmSendHeader} />}
        >
          <ModalContainer>
            <SendNowWarning>
              <FormattedMessage {...messages.toAllUsers} />
            </SendNowWarning>
            <ButtonsWrapper>
              <Button
                buttonStyle="secondary"
                linkTo={`/admin/messaging/emails/custom/${campaign.id}/edit`}
              >
                <FormattedMessage {...messages.changeRecipientsButton} />
              </Button>
              <Button
                buttonStyle="primary"
                onClick={confirmSendCampaign(campaign.id)}
                icon="send"
                iconPos="right"
                disabled={isCampaignSending}
                processing={isCampaignSending}
              >
                <FormattedMessage {...messages.sendNowButton} />
              </Button>
            </ButtonsWrapper>
          </ModalContainer>
        </Modal>
      </Box>
    );
  }

  return null;
};

export default Show;
