import React from 'react';

import styled from 'styled-components';

import { ICampaignData } from 'api/campaigns/types';
import useDeleteCampaign from 'api/campaigns/useDeleteCampaign';

import PreviewFrame from 'components/admin/Email/PreviewFrame';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

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
  const { projectId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const { mutate: deleteCampaign, isLoading } = useDeleteCampaign();

  const handleDelete = () => {
    const deleteMessage = formatMessage(messages.campaignDeletionConfirmation);
    if (window.confirm(deleteMessage)) {
      deleteCampaign(campaign.id, {
        onSuccess: () => {
          if (projectId) {
            clHistory.push(`/admin/projects/${projectId}/messaging`);
          } else {
            clHistory.push('/admin/messaging/emails/custom');
          }
        },
      });
    }
  };

  return (
    <>
      <PreviewFrame campaignId={campaign.id} />
      <ButtonWrapper>
        <ButtonWithLink
          buttonStyle="delete"
          icon="delete"
          onClick={handleDelete}
          processing={isLoading}
        >
          {formatMessage(messages.deleteCampaignButton)}
        </ButtonWithLink>
      </ButtonWrapper>
    </>
  );
};

export default DraftCampaignDetails;
