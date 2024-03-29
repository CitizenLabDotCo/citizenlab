import React from 'react';

import GetCampaign from 'resources/GetCampaign';
import styled from 'styled-components';

import { ICampaignData } from 'api/campaigns/types';
import useDeleteCampaign from 'api/campaigns/useDeleteCampaign';

import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

import PreviewFrame from './PreviewFrame';

const ButtonWrapper = styled.div`
  margin: 40px 0;
  display: flex;
  justify-content: flex-end;
`;

interface InputProps {
  campaignId: string;
}

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps {}

const DraftCampaignDetails = ({ campaign }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: deleteCampaign, isLoading } = useDeleteCampaign();

  const handleDelete = () => {
    const deleteMessage = formatMessage(messages.campaignDeletionConfirmation);
    if (window.confirm(deleteMessage)) {
      deleteCampaign(campaign.id, {
        onSuccess: () => {
          clHistory.push('/admin/messaging/emails/custom');
        },
      });
    }
  };

  return (
    <>
      <PreviewFrame campaignId={campaign.id} />
      <ButtonWrapper>
        <Button
          buttonStyle="delete"
          icon="delete"
          onClick={handleDelete}
          processing={isLoading}
        >
          {formatMessage(messages.deleteCampaignButton)}
        </Button>
      </ButtonWrapper>
    </>
  );
};

export default (inputProps: InputProps) => (
  <GetCampaign id={inputProps.campaignId}>
    {(campaign) =>
      isNilOrError(campaign) ? null : (
        <DraftCampaignDetails {...inputProps} campaign={campaign} />
      )
    }
  </GetCampaign>
);
