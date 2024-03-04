import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import useAddCampaign from 'api/campaigns/useAddCampaign';
import useAuthUser from 'api/me/useAuthUser';

import messages from '../../messages';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

const New = () => {
  const { data: authUser } = useAuthUser();
  const { isLoading, mutateAsync: createCampaign } = useAddCampaign();
  const handleSubmit = async (values: FormValues) => {
    const response = await createCampaign({
      campaign_name: 'manual',
      ...values,
    });
    clHistory.push(`/admin/messaging/emails/custom/${response.data.id}`);
  };

  const goBack = () => {
    clHistory.push('/admin/messaging/emails/custom');
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.addCampaignTitle} />
      </PageTitle>
      <CampaignForm
        isLoading={isLoading}
        defaultValues={{
          sender: 'author',
          reply_to:
            (!isNilOrError(authUser) && authUser.data.attributes.email) || '',
        }}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default New;
