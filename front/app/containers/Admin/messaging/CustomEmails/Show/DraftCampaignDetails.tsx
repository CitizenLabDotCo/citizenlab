import React from 'react';
import { deleteCampaign } from 'services/campaigns';
import { ICampaignData } from 'api/campaigns/types';
import clHistory from 'utils/cl-router/history';

import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import Button from 'components/UI/Button';
import PreviewFrame from './PreviewFrame';
import styled from 'styled-components';

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

  const handleDelete = () => {
    const deleteMessage = formatMessage(messages.campaignDeletionConfirmation);
    if (window.confirm(deleteMessage)) {
      deleteCampaign(campaign.id).then(() => {
        clHistory.push('/admin/messaging/emails/custom');
      });
    }
  };

  return (
    <>
      <PreviewFrame campaignId={campaign.id} />
      <ButtonWrapper>
        <Button buttonStyle="delete" icon="delete" onClick={handleDelete}>
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
