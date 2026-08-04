import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';

import useAddSmsCampaign from 'api/campaigns/sms/useAddSmsCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';
import SmsCampaignForm, { FormValues } from '../SmsCampaignForm';

const NewSmsCampaign = () => {
  const { isLoading, mutateAsync: createCampaign } = useAddSmsCampaign();

  const handleSubmit = async (values: FormValues) => {
    const response = await createCampaign(values);
    clHistory.push(`/admin/messaging/sms/${response.data.id}`);
  };

  const goBack = () => {
    clHistory.push('/admin/messaging/sms');
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <Title>
        <FormattedMessage {...messages.addSmsCampaignTitle} />
      </Title>
      <SmsCampaignForm isLoading={isLoading} onSubmit={handleSubmit} />
    </Box>
  );
};

export default NewSmsCampaign;
