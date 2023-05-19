import React from 'react';

import useAuthUser from 'hooks/useAuthUser';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { Box, colors } from '@citizenlab/cl2-component-library';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { PageTitle } from '../CampaignForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { CampaignFormValues } from 'api/campaigns/types';
import useAddCampaign from 'api/campaigns/useAddCampaign';

const New = () => {
  const { mutateAsync: addCampaign } = useAddCampaign();
  const authUser = useAuthUser();
  const handleSubmit = async (values: CampaignFormValues) => {
    const response = await addCampaign({
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
        defaultValues={{
          sender: 'author',
          reply_to:
            (!isNilOrError(authUser) && authUser.attributes.email) || '',
        }}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default New;
