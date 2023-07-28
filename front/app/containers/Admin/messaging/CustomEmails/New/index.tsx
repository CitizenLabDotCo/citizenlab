import React from 'react';

import useAuthUser from 'api/me/useAuthUser';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { Box, colors } from '@citizenlab/cl2-component-library';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import useAddCampaign from 'api/campaigns/useAddCampaign';

const New = () => {
  const { data: authUser } = useAuthUser();
  const { mutate: createCampaign, isLoading } = useAddCampaign();
  const handleSubmit = (values: FormValues) => {
    createCampaign(
      {
        campaign_name: 'manual',
        ...values,
      },
      {
        onSuccess: (response) => {
          clHistory.push(`/admin/messaging/emails/custom/${response.data.id}`);
        },
      }
    );
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
