import React, { useState } from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ICampaignData } from 'api/campaigns/types';
import useDeleteCampaign from 'api/campaigns/useDeleteCampaign';

import PreviewFrame from 'components/admin/Email/PreviewFrame';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const ButtonWrapper = styled.div`
  margin: 40px 0;
  display: flex;
  justify-content: flex-end;
`;

interface Props {
  campaign: ICampaignData;
}

const DraftCampaignDetails = ({ campaign }: Props) => {
  const { projectId } = useParams();
  const { formatMessage } = useIntl();
  const { mutate: deleteCampaign, isLoading } = useDeleteCampaign();

  const handleDelete = () => {
    deleteCampaign(campaign.id, {
      onSuccess: () => {
        setOpenDeleteModal(false);
        if (projectId) {
          clHistory.push(`/admin/projects/${projectId}/messaging`);
        } else {
          clHistory.push('/admin/messaging/emails/custom');
        }
      },
    });
  };

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  return (
    <>
      <PreviewFrame campaignId={campaign.id} />
      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="delete"
          icon="delete"
          onClick={handleOpenDeleteModal}
          processing={isLoading}
        >
          {formatMessage(messages.deleteCampaignButton)}
        </ButtonWithLink>
      </ButtonWrapper>
      <Modal
        opened={openDeleteModal}
        close={handleCloseDeleteModal}
        hideCloseButton
      >
        <Title variant="h2">
          {formatMessage(messages.campaignDeleteConfirmation)}
        </Title>
        <Text color="textSecondary" mt="12px">
          {formatMessage(messages.campaignDeleteWarning)}
        </Text>
        <Box display="flex" gap="16px" justifyContent="flex-end" mt="24px">
          <ButtonWithLink
            buttonStyle="delete"
            icon="delete"
            onClick={handleDelete}
            processing={isLoading}
          >
            {formatMessage(messages.deleteCampaignButton)}
          </ButtonWithLink>
          <ButtonWithLink
            buttonStyle="secondary"
            onClick={handleCloseDeleteModal}
          >
            {formatMessage(messages.cancel)}
          </ButtonWithLink>
        </Box>
      </Modal>
    </>
  );
};

export default DraftCampaignDetails;
