import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { FormattedTime, FormattedDate } from 'react-intl';
import styled from 'styled-components';

import {
  ITextingCampaignData,
  TTextingCampaignStatus,
} from 'api/texting_campaigns/types';
import useTextingCampaign from 'api/texting_campaigns/useTextingCampaign';

import HelmetIntl from 'components/HelmetIntl';

import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

import FormattedStatusLabel from '../components/FormattedStatusLabel';
import SMSCampaignForm from '../components/SMSCampaignForm';
import TextingHeader from '../components/TextingHeader';

const StyledSMSCampaignForm = styled(SMSCampaignForm)`
  width: 500px;
`;

const getTitleMessage = (
  campaignStatus: TTextingCampaignStatus | undefined
) => {
  switch (campaignStatus) {
    case 'draft':
      return 'Draft SMS';
    case 'sending':
      return 'Sending SMS';
    case 'sent':
      return 'Sent SMS';
    case 'failed':
      return 'Failed SMS';
    default:
      return 'Created SMS';
  }
};

const getAdditionalInfoByStatus = (campaign: ITextingCampaignData) => {
  switch (campaign.attributes.status) {
    case 'draft':
      return (
        <>
          Created at: <FormattedTime value={campaign.attributes.created_at} />,{' '}
          <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    case 'sending':
      return (
        <>
          Began sending at:{' '}
          <FormattedTime value={campaign.attributes.updated_at} />,{' '}
          <FormattedDate value={campaign.attributes.updated_at} />
        </>
      );
    case 'sent':
      return (
        campaign.attributes.sent_at && (
          <>
            Sent at: <FormattedTime value={campaign.attributes.sent_at} />,{' '}
            <FormattedDate value={campaign.attributes.sent_at} />,
          </>
        )
      );
    case 'failed':
      return (
        <>
          Created at: <FormattedTime value={campaign.attributes.created_at} />,{' '}
          <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
    default:
      return (
        <>
          Created at: <FormattedTime value={campaign.attributes.created_at} />,{' '}
          <FormattedDate value={campaign.attributes.created_at} />
        </>
      );
  }
};

const ExistingSMSCampaign = (props: WithRouterProps) => {
  const { campaignId } = props.params;
  const { data: campaign } = useTextingCampaign(campaignId);

  // show campaign not found
  if (isNilOrError(campaign)) return null;

  const { status } = campaign.data.attributes;
  const isDraft = status === 'draft';

  return (
    <Box background={colors.white} p="40px">
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'View SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'View SMS',
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
        <span>{getAdditionalInfoByStatus(campaign.data)}</span>
      </>
      <StyledSMSCampaignForm formIsLocked={!isDraft} campaign={campaign.data} />
    </Box>
  );
};

export default withRouter(ExistingSMSCampaign);
