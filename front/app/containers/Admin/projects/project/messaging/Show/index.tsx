import * as React from 'react';

import {
  StatusLabel,
  IconTooltip,
  colors,
  Title,
  Box,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import { isDraft } from 'api/campaigns/util';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import DraftCampaignDetails from 'components/admin/Email/DraftCampaignDetails';
import SentCampaignDetails from 'components/admin/Email/SentCampaignDetails';
import Stamp from 'components/admin/Email/Stamp';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
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

const Show = () => {
  const { projectId, campaignId } = useParams() as {
    projectId: string;
    campaignId: string;
  };

  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useCampaign(campaignId);

  const {
    mutate: sendCampaign,
    isLoading: isSendingCampaign,
    error: apiSendErrors,
  } = useSendCampaign();
  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();

  const { data: sender } = useUserById(
    campaign?.data.relationships.author.data.id
  );
  const isLoading = isSendingCampaign || isSendingCampaignPreview;

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const handleSend = () => {
    sendCampaign(campaignId);
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

  if (campaign) {
    const senderType = campaign.data.attributes.sender;
    const senderName = getSenderName(senderType);

    return (
      <Box p="44px">
        <Box background={colors.white} p="40px" id="e2e-custom-email-container">
          <GoBackButton linkTo={`/admin/projects/${projectId}/messaging`} />
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
                  linkTo={`/admin/projects/${projectId}/messaging/${campaign.data.id}/edit`}
                  buttonStyle="secondary-outlined"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </ButtonWithLink>
                <ButtonWithLink
                  buttonStyle="admin-dark"
                  icon="send"
                  iconPos="right"
                  onClick={handleSend}
                  disabled={isLoading}
                  processing={isSendingCampaign}
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
                <span>
                  <FormattedMessage {...messages.projectParticipants} />
                </span>
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
        </Box>
      </Box>
    );
  }

  return null;
};

export default Show;
