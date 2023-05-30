import React from 'react';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from '../components/TextingHeader';
import FormattedStatusLabel from '../components/FormattedStatusLabel';
import SMSCampaignForm from '../components/SMSCampaignForm';
// i18n
import { FormattedTime, FormattedDate } from 'react-intl';

// utils
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

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
        <>
          Sent at: <FormattedTime value={campaign.attributes.sent_at} />,{' '}
          <FormattedDate value={campaign.attributes.sent_at} />,
        </>
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
  const campaign = useTextingCampaign(campaignId);

  // show campaign not found
  if (isNilOrError(campaign)) return null;

  const { status } = campaign.attributes;
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
        <span>{getAdditionalInfoByStatus(campaign)}</span>
      </>
      <StyledSMSCampaignForm formIsLocked={!isDraft} campaign={campaign} />
    </Box>
  );
};

export default withRouter(ExistingSMSCampaign);
