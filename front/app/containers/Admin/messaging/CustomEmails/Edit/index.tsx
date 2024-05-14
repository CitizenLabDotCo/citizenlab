import * as React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useCampaign from 'api/campaigns/useCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

const Edit = () => {
  const { campaignId } = useParams() as {
    campaignId: string;
  };
  const { data: campaign } = useCampaign(campaignId);
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();

  if (!campaign) {
    return null;
  }
  const handleSubmit = async (values: FormValues) => {
    await updateCampaign({ id: campaign.data.id, campaign: values });
    clHistory.push(`/admin/messaging/emails/custom/${campaign.data.id}`);
  };

  const goBack = () => {
    clHistory.push(`/admin/messaging/emails/custom/${campaign.data.id}`);
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.editCampaignTitle} />
      </PageTitle>
      <CampaignForm
        isLoading={isLoading}
        onSubmit={handleSubmit}
        campaignContextId={campaign.data.attributes.context_id}
        defaultValues={{
          sender: campaign.data.attributes.sender,
          reply_to: campaign.data.attributes.reply_to,
          subject_multiloc: campaign.data.attributes.subject_multiloc,
          body_multiloc: campaign.data.attributes.body_multiloc,
          group_ids: campaign.data.relationships.groups.data.map((d) => d.id),
        }}
      />
    </Box>
  );
};

export default Edit;
