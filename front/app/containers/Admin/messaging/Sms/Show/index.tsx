import React, { useState } from 'react';

import {
  StatusLabel,
  colors,
  Title,
  Box,
  Text,
  Success,
} from '@citizenlab/cl2-component-library';

import useCampaign from 'api/campaigns/useCampaign';
import useDeleteCampaign from 'api/campaigns/useDeleteCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import { isDraft } from 'api/campaigns/util';
import useGroupsByIds from 'api/groups/useGroupsByIds';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../../messages';

const Show = () => {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { data: campaign } = useCampaign(campaignId);
  const localize = useLocalize();
  const {
    mutate: sendCampaign,
    isLoading: isSending,
    error: apiSendErrors,
  } = useSendCampaign();
  const {
    mutate: sendPreview,
    isLoading: isSendingPreview,
    error: apiPreviewErrors,
  } = useSendCampaignPreview();
  const { mutate: deleteCampaign, isLoading: isDeleting } = useDeleteCampaign();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [previewSent, setPreviewSent] = useState(false);

  const groupIds =
    campaign?.data.relationships.groups.data.map((group) => group.id) || [];
  const groups = useGroupsByIds(groupIds);

  if (!campaign) return null;

  const draft = isDraft(campaign.data);
  const noGroupsSelected = groupIds.length === 0;

  const handleSend = () => {
    if (noGroupsSelected) {
      setShowConfirm(true);
    } else {
      sendCampaign(campaignId);
    }
  };

  const confirmSend = () => {
    sendCampaign(campaignId, { onSuccess: () => setShowConfirm(false) });
  };

  const handleSendPreview = () => {
    setPreviewSent(false);
    sendPreview(campaignId, { onSuccess: () => setPreviewSent(true) });
  };

  const handleDelete = () => {
    deleteCampaign(campaignId, {
      onSuccess: () => clHistory.push('/admin/messaging/sms'),
    });
  };

  const goBack = () => clHistory.push('/admin/messaging/sms');

  const groupNames = groups
    .map((group) =>
      group ? localize(group.data.attributes.title_multiloc) : null
    )
    .filter(Boolean)
    .join(', ');

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <Box display="flex" alignItems="center" gap="12px" mt="20px" mb="24px">
        <Title m="0px">
          <FormattedMessage {...messages.smsCampaigns} />
        </Title>
        {draft ? (
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

      <Text fontWeight="bold" mb="4px">
        <FormattedMessage {...messages.fieldTo} />
      </Text>
      <Text mb="20px">
        {noGroupsSelected ? (
          <FormattedMessage {...messages.allUsers} />
        ) : (
          groupNames
        )}
      </Text>

      <Text fontWeight="bold" mb="4px">
        <FormattedMessage {...messages.fieldSmsBody} />
      </Text>
      <Box
        border={`1px solid ${colors.divider}`}
        borderRadius="3px"
        p="16px"
        mb="24px"
      >
        <Text m="0px" whiteSpace="pre-wrap">
          <T value={campaign.data.attributes.body_multiloc} />
        </Text>
      </Box>

      {draft && (
        <Box display="flex" gap="10px" alignItems="center" flexWrap="wrap">
          <ButtonWithLink
            to="/admin/messaging/sms/$campaignId/edit"
            params={{ campaignId: campaign.data.id }}
            buttonStyle="secondary-outlined"
            icon="edit"
          >
            <FormattedMessage {...messages.editButtonLabel} />
          </ButtonWithLink>
          <ButtonWithLink
            buttonStyle="secondary-outlined"
            icon="send"
            onClick={handleSendPreview}
            processing={isSendingPreview}
            disabled={isSendingPreview}
          >
            <FormattedMessage {...messages.sendSmsPreviewButton} />
          </ButtonWithLink>
          <ButtonWithLink
            buttonStyle="primary"
            icon="send"
            iconPos="right"
            onClick={handleSend}
            processing={isSending}
            disabled={isSending}
          >
            <FormattedMessage {...messages.sendNowButton} />
          </ButtonWithLink>
          <ButtonWithLink
            buttonStyle="delete"
            onClick={() => setShowDeleteModal(true)}
          >
            <FormattedMessage {...messages.deleteSmsButton} />
          </ButtonWithLink>
        </Box>
      )}

      {previewSent && (
        <Box mt="16px">
          <Success
            text={<FormattedMessage {...messages.smsPreviewSentConfirmation} />}
          />
        </Box>
      )}
      {apiPreviewErrors && (
        <Box mt="16px">
          <Error apiErrors={apiPreviewErrors.errors['base']} />
        </Box>
      )}
      {apiSendErrors && (
        <Box mt="16px">
          <Error apiErrors={apiSendErrors.errors['base']} />
        </Box>
      )}

      <Modal
        opened={showConfirm}
        close={() => setShowConfirm(false)}
        header={<FormattedMessage {...messages.confirmSendSmsHeader} />}
      >
        <Box p="30px">
          <Text mb="20px">
            <FormattedMessage {...messages.toAllUsers} />
          </Text>
          <Box display="flex" gap="10px" justifyContent="flex-end">
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              onClick={() => setShowConfirm(false)}
            >
              <FormattedMessage {...messages.changeRecipientsButton} />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="primary"
              icon="send"
              iconPos="right"
              onClick={confirmSend}
              processing={isSending}
              disabled={isSending}
            >
              <FormattedMessage {...messages.sendNowButton} />
            </ButtonWithLink>
          </Box>
        </Box>
      </Modal>

      <Modal
        opened={showDeleteModal}
        close={() => setShowDeleteModal(false)}
        header={<FormattedMessage {...messages.deleteSmsButton} />}
      >
        <Box p="30px">
          <Text mb="20px">
            <FormattedMessage {...messages.deleteSmsConfirmation} />
          </Text>
          <Box display="flex" gap="10px" justifyContent="flex-end">
            <ButtonWithLink
              buttonStyle="secondary-outlined"
              onClick={() => setShowDeleteModal(false)}
            >
              <FormattedMessage {...messages.cancelButton} />
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="delete"
              onClick={handleDelete}
              processing={isDeleting}
              disabled={isDeleting}
            >
              <FormattedMessage {...messages.deleteSmsButton} />
            </ButtonWithLink>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Show;
