import React, { useState } from 'react';

import { Box, colors, Text, Success } from '@citizenlab/cl2-component-library';

import useCampaign from 'api/campaigns/useCampaign';
import useDeleteCampaign from 'api/campaigns/useDeleteCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import { isDraft } from 'api/campaigns/util';
import { IGroupData } from 'api/groups/types';
import useGroupsByIds from 'api/groups/useGroupsByIds';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../../messages';

import ConfirmSendModal from './ConfirmSendModal';
import DeleteModal from './DeleteModal';
import Header from './Header';
import Recipients from './Recipients';

const Show = () => {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { data: campaign } = useCampaign(campaignId);
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

  const selectedGroups = groups
    .map((group) => group?.data)
    .filter((group): group is IGroupData => group !== undefined);

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />

      <Header
        campaign={campaign.data}
        draft={draft}
        onSend={handleSend}
        isSending={isSending}
      />

      {previewSent && (
        <Box mb="8px">
          <Success
            text={<FormattedMessage {...messages.smsPreviewSentConfirmation} />}
            showIcon
            showBackground
          />
        </Box>
      )}
      {apiPreviewErrors && (
        <Box mb="8px">
          <Error apiErrors={apiPreviewErrors.errors['base']} />
        </Box>
      )}
      {apiSendErrors && (
        <Box mb="8px">
          <Error apiErrors={apiSendErrors.errors['base']} />
        </Box>
      )}

      <Recipients
        selectedGroups={selectedGroups}
        noGroupsSelected={noGroupsSelected}
        draft={draft}
        onSendPreview={handleSendPreview}
        isSendingPreview={isSendingPreview}
      />

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
        <Box display="flex">
          <ButtonWithLink
            buttonStyle="delete"
            icon="delete"
            onClick={() => setShowDeleteModal(true)}
          >
            <FormattedMessage {...messages.deleteSmsButton} />
          </ButtonWithLink>
        </Box>
      )}

      <ConfirmSendModal
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSend}
        isSending={isSending}
      />

      <DeleteModal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default Show;
