import * as React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCampaign from 'api/campaigns/useCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';
import messages from '../messages';

const Edit = () => {
  const { projectId, campaignId } = useParams() as {
    projectId: string;
    campaignId: string;
  };
  const { data: campaign } = useCampaign(campaignId);
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();

  if (!campaign) {
    return null;
  }

  const handleSubmit = async (values: FormValues) => {
    await updateCampaign({ id: campaign.data.id, campaign: values });
    clHistory.push(
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      `/admin/projects/${projectId}/messaging/${campaign?.data.id}`
    );
  };

  const goBack = () => {
    clHistory.push(
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      `/admin/projects/${projectId}/messaging/${campaign?.data.id}`
    );
  };

  return (
    <Box p="44px">
      <Box background={colors.white} p="40px">
        <GoBackButton onClick={goBack} />
        <PageTitle>
          <FormattedMessage {...messages.editCampaignTitle} />
        </PageTitle>
        <CampaignForm
          isLoading={isLoading}
          onSubmit={handleSubmit}
          defaultValues={{
            sender: campaign.data.attributes.sender,
            reply_to: campaign.data.attributes.reply_to,
            subject_multiloc: campaign.data.attributes.subject_multiloc,
            body_multiloc: campaign.data.attributes.body_multiloc,
          }}
        />
      </Box>
    </Box>
  );
};

export default Edit;
