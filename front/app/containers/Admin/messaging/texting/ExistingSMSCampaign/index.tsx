import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import FormattedStatusLabel from '../components/FormattedStatusLabel';
import SMSCampaignForm from '../components/SMSCampaignForm';
// i18n
import { FormattedDate } from 'react-intl';

// utils
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';

// hooks
import useTextingCampaign from 'hooks/useTextingCampaign';

// services
import {
  ITextingCampaignData,
  TTextingCampaignStatus,
} from 'services/textingCampaigns';

// styling
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

const StyledSMSCampaignForm = styled(SMSCampaignForm)`
  width: 500px;
`;

const getTitleMessage = (
  campaignStatus: TTextingCampaignStatus | undefined
) => {
  switch (campaignStatus) {
    case 'draft':
      return 'Draft SMS Campaign';
    case 'sending':
      return 'Sending SMS Campaign';
    case 'sent':
      return 'Sent SMS Campaign';
    case 'failed':
      return 'Failed SMS Campaign';
    default:
      return 'Created SMS Campaign';
  }
};

const getAdditionalInfoByStatus = (campaign: ITextingCampaignData) => {
  switch (campaign.attributes.status) {
    case 'draft':
      return (
        <>
          Created at: <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    case 'sending':
      return (
        <>
          Sent at: <FormattedDate value={campaign.attributes.sent_at} />
        </>
      );
    case 'sent':
      return (
        <>
          Sent at: <FormattedDate value={campaign.attributes.sent_at} />
        </>
      );
    case 'failed':
      return (
        <>
          Created at: <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    default:
      return (
        <>
          Created at: <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
  }
};

const ExistingSMSCampaign = (props: WithRouterProps) => {
  const { campaignId } = props.params;
  const campaign = useTextingCampaign(campaignId);

  // show campaign not found
  if (isNilOrError(campaign)) return null;

  const { status } = campaign.attributes;
  const isDraft = status === 'draft';

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'View SMS campaign' }}
        description={{
          id: 'test',
          defaultMessage: 'View SMS campaign description',
        }}
      />
      <TextingHeader
        headerMessage={getTitleMessage(status)}
        onClickGoBack={clHistory.goBack}
      />
      <>
        <Box display="inline-block" marginRight="12px" marginBottom="24px">
          <FormattedStatusLabel campaignStatus={status} />
        </Box>
        <span>{getAdditionalInfoByStatus(campaign)}</span>
      </>
      <StyledSMSCampaignForm formIsLocked={!isDraft} campaign={campaign} />
    </>
  );
};

export default withRouter(ExistingSMSCampaign);
