import React from 'react';
import Modal from 'components/UI/Modal';
import { Box } from '@citizenlab/cl2-component-library';
import EditCampaignForm from '../EditCampaignForm';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import useCampaign from 'api/campaigns/useCampaign';
import { CampaignFormValues } from 'api/campaigns/types';
import messages from 'containers/Admin/messaging/messages';
import { useIntl } from 'utils/cl-intl';

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
