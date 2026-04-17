import * as React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { ICampaign, CampaignFormValues } from 'api/campaigns/types';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  campaign: ICampaign;
  opened: boolean;
  onClose: () => void;
}

const CancelScheduleModal = ({ campaign, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateCampaign, isLoading: isUpdatingCampaign } =
    useUpdateCampaign();

  // to cancel schedule campaign ( send scheduledAt as null )
  const handleCancelSchedule = () => {
    updateCampaign(
      {
        id: campaign.data.id,
        campaign: { scheduled_at: null } as CampaignFormValues,
      },
      {
        onSuccess: onClose,
      }
    );
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      header={formatMessage(messages.cancelScheduleTitle)}
    >
      <Box p="32px">
        <Text mt="0">
          <FormattedMessage {...messages.cancelScheduleDescription} />
        </Text>
        <Box display="flex" gap="16px" justifyContent="flex-end">
          <Button onClick={onClose} buttonStyle="secondary">
            <FormattedMessage {...messages.keepSchedule} />
          </Button>
          <Button
            onClick={handleCancelSchedule}
            buttonStyle="admin-dark"
            disabled={isUpdatingCampaign}
          >
            <FormattedMessage {...messages.confirmCancelSchedule} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CancelScheduleModal;
