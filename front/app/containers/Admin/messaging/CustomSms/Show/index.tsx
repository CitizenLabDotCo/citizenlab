import React, { useState } from 'react';

import {
  StatusLabel,
  colors,
  Title,
  Box,
  Text,
  Button,
  Success,
} from '@citizenlab/cl2-component-library';

import { ICampaignData } from 'api/campaigns/types';
import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';

import { Section, SectionField } from 'components/admin/Section';
import T from 'components/T';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams, useSearch } from 'utils/router';

import messages from '../../messages';

const smsStatus = (campaign: ICampaignData) => {
  if (campaign.attributes.delivery_stats) return 'sent';
  if (campaign.attributes.scheduled_at) return 'scheduled';
  return 'draft';
};

const Show = () => {
  const { formatMessage } = useIntl();
  const { campaignId } = useParams({ strict: false }) as {
    campaignId: string;
  };
  const { data: campaign } = useCampaign(campaignId);
  const { mutate: sendCampaign, isLoading: isSending } = useSendCampaign();
  const { mutate: sendPreview } = useSendCampaignPreview();

  const search = useSearch({
    from: '/$locale/admin/messaging/sms/custom/$campaignId',
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [previewSent, setPreviewSent] = useState(false);

  if (!campaign) return null;

  const status = smsStatus(campaign.data);
  const hasGroups = campaign.data.relationships.groups.data.length > 0;

  const onSendClick = () => {
    if (!hasGroups) {
      setShowConfirmation(true);
    } else {
      sendCampaign(campaignId);
    }
  };

  const confirmSend = () => {
    sendCampaign(campaignId, { onSuccess: () => setShowConfirmation(false) });
  };

  const onPreviewClick = () => {
    sendPreview(campaignId, { onSuccess: () => setPreviewSent(true) });
  };

  const goBack = () => clHistory.push('/admin/messaging/sms/custom');

  const deliveryStats = campaign.data.attributes.delivery_stats as
    | Record<string, number>
    | undefined;
  const totalSent = deliveryStats
    ? Object.values(deliveryStats).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />

      {search.created && (
        <Box mb="20px">
          <Success text={formatMessage(messages.smsCreated)} />
        </Box>
      )}
      {previewSent && (
        <Box mb="20px">
          <Success text={formatMessage(messages.smsPreviewSentConfirmation)} />
        </Box>
      )}

      <Box display="flex" alignItems="center" gap="12px" mb="20px">
        <Title m="0px">
          <FormattedMessage {...messages.textMessages} />
        </Title>
        <StatusLabel
          backgroundColor={
            status === 'sent' ? colors.success : colors.coolGrey300
          }
          text={<FormattedMessage {...messages[status]} />}
        />
      </Box>

      <Section>
        <SectionField>
          <Text fontWeight="bold" m="0px">
            <FormattedMessage {...messages.fieldSmsBody} />
          </Text>
          <Text>
            <T value={campaign.data.attributes.body_multiloc} />
          </Text>
        </SectionField>
        <SectionField>
          <Text color="textSecondary">
            <FormattedMessage {...messages.smsRecipientsNote} />
          </Text>
        </SectionField>
        {status === 'sent' && (
          <SectionField>
            <Text fontWeight="bold" m="0px">
              <FormattedMessage {...messages.sent} />
            </Text>
            <Text>{totalSent}</Text>
          </SectionField>
        )}
      </Section>

      {status !== 'sent' && (
        <Box display="flex" gap="10px" mt="20px">
          <Button
            id="e2e-sms-send-now"
            onClick={onSendClick}
            processing={isSending}
          >
            <FormattedMessage {...messages.sendNowButton} />
          </Button>
          <Button buttonStyle="secondary-outlined" onClick={onPreviewClick}>
            <FormattedMessage {...messages.sendTestSmsButton} />
          </Button>
        </Box>
      )}

      <Modal
        opened={showConfirmation}
        close={() => setShowConfirmation(false)}
        header={<FormattedMessage {...messages.confirmSendHeader} />}
      >
        <Box p="30px">
          <Text>
            <FormattedMessage {...messages.smsRecipientsNote} />
          </Text>
          <Box display="flex" gap="10px" mt="20px">
            <Button onClick={confirmSend} processing={isSending}>
              <FormattedMessage {...messages.send} />
            </Button>
            <Button
              buttonStyle="secondary-outlined"
              onClick={() => setShowConfirmation(false)}
            >
              <FormattedMessage {...messages.changeRecipientsButton} />
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Show;
