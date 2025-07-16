import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { CampaignFormValues } from 'api/campaigns/types';
import useCampaign from 'api/campaigns/useCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import messages from 'containers/Admin/messaging/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import EditCampaignForm from '../EditCampaignForm';

const EditModal = ({
  campaignId,
  onClose,
}: {
  campaignId: string;
  onClose: () => void;
}) => {
  const { formatMessage } = useIntl();
  const { data: campaign } = useCampaign(campaignId);
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();

  if (!campaign) return null;

  const handleSubmit = async (values: CampaignFormValues) => {
    await updateCampaign({ id: campaign.data.id, campaign: values });
  };

  return (
    <Modal
      opened={true}
      close={() => onClose()}
      header={formatMessage(messages.editModalTitle)}
    >
      <Box mx="30px" mt="30px">
        <EditCampaignForm
          isLoading={isLoading}
          onSubmit={handleSubmit}
          campaign={campaign}
        />
      </Box>
    </Modal>
  );
};

export default EditModal;
