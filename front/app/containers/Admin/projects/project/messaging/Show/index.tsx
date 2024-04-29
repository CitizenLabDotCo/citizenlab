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
import useAuthUser from 'api/me/useAuthUser';

import useLocalize from 'hooks/useLocalize';

import Stamp from 'components/admin/Email/Stamp';
import T from 'components/T';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';

import DraftCampaignDetails from './DraftCampaignDetails';
import SentCampaignDetails from './SentCampaignDetails';

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

const Show = () => {
  const { projectId, campaignId } = useParams() as {
    projectId: string;
    campaignId: string;
  };

  const { data: user } = useAuthUser();
  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useCampaign(campaignId);

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

  const handleSend = () => () => {
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

    if (senderType === 'author' && !isNilOrError(user)) {
      senderName = getFullName(user.data);
    } else if (senderType === 'organization' && !isNilOrError(tenant)) {
      senderName = localize(
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
          <PageHeader>
            <PageTitleWrapper>
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
            </PageTitleWrapper>
            {isDraft(campaign.data) && (
              <Buttons>
                <Button
                  linkTo={`/admin/projects/${projectId}/messaging/${campaign.data.id}/edit`}
                  buttonStyle="secondary"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
                <Button
                  buttonStyle="admin-dark"
                  icon="send"
                  iconPos="right"
                  onClick={handleSend}
                  disabled={isLoading}
                  processing={isLoading}
                >
                  <FormattedMessage {...messages.send} />
                </Button>
              </Buttons>
            )}
          </PageHeader>
          {apiSendErrors && (
            <Box mb="8px">
              <Error apiErrors={apiSendErrors.errors['base']} />
            </Box>
          )}
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
              </div>
            </FromTo>
            {isDraft(campaign.data) && (
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
