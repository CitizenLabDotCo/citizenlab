import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAddCampaign from 'api/campaigns/useAddCampaign';
import useAuthUser from 'api/me/useAuthUser';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';
import messages from '../messages';

const New = () => {
  const { projectId } = useParams();
  const { data: authUser } = useAuthUser();
  const { isLoading, mutateAsync: createCampaign } = useAddCampaign();
  const handleSubmit = async (values: FormValues) => {
    const response = await createCampaign({
      context_id: projectId,
      campaign_name: 'manual_project_participants',
      ...values,
    });
    clHistory.push(
      `/admin/projects/${projectId}/messaging/${response.data.id}`
    );
  };

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/messaging`);
  };

  return (
    <Box p="44px">
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
    </Box>
  );
};

export default New;
