import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';

import useAddCampaign from 'api/campaigns/useAddCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';
import CampaignForm, { FormValues } from '../CampaignForm';

const New = () => {
  const { isLoading, mutateAsync: createCampaign } = useAddCampaign();

  const handleSubmit = async (values: FormValues) => {
    const response = await createCampaign({
      campaign_name: 'sms_manual',
      ...values,
    });
    clHistory.push(
      `/admin/messaging/sms/custom/${response.data.id}?created=true`
    );
  };

  const goBack = () => {
    clHistory.push('/admin/messaging/sms/custom');
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <Title>
        <FormattedMessage {...messages.addSmsCampaignTitle} />
      </Title>
      <CampaignForm isLoading={isLoading} onSubmit={handleSubmit} />
    </Box>
  );
};

export default New;
