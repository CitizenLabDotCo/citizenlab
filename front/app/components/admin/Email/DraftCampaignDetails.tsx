import React, { useState } from 'react';

import { Box, Title, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ICampaignData } from 'api/campaigns/types';
import useDeleteCampaign from 'api/campaigns/useDeleteCampaign';

import PreviewFrame from 'components/admin/Email/PreviewFrame';
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
        setIsDeleteModalOpen(false);
        if (projectId) {
          clHistory.push(`/admin/projects/${projectId}/messaging`);
        } else {
          clHistory.push('/admin/messaging/emails/custom');
        }
      },
    });
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  return (
    <>
      <PreviewFrame campaignId={campaign.id} />
      <ButtonWrapper>
        <Button
          buttonStyle="delete"
          icon="delete"
          onClick={() => setIsDeleteModalOpen(true)}
          processing={isLoading}
        >
          {formatMessage(messages.deleteCampaignButton)}
        </Button>
      </ButtonWrapper>
      <Modal
        opened={isDeleteModalOpen}
        close={() => setIsDeleteModalOpen(false)}
        hideCloseButton
        niceHeader
        header={
          <Title variant="h2" px="12px">
            {formatMessage(messages.campaignDeleteConfirmation)}
          </Title>
        }
      >
        <Box mt="8px" p="12px">
          <Text color="textSecondary" mt="12px">
            {formatMessage(messages.campaignDeleteWarning)}
          </Text>
          <Box display="flex" gap="16px" justifyContent="flex-end" mt="24px">
            <Button
              buttonStyle="delete"
              icon="delete"
              onClick={handleDelete}
              processing={isLoading}
            >
              {formatMessage(messages.deleteCampaignButton)}
            </Button>
            <Button
              buttonStyle="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {formatMessage(messages.cancel)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default DraftCampaignDetails;
