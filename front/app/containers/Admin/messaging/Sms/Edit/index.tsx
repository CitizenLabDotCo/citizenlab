import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';

import useCampaign from 'api/campaigns/useCampaign';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../../messages';
import SmsCampaignForm, { FormValues } from '../SmsCampaignForm';

const EditSmsCampaign = () => {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const { data: campaign } = useCampaign(campaignId);
  const { isLoading, mutateAsync: updateCampaign } = useUpdateCampaign();

  if (!campaign) return null;

  const handleSubmit = async (values: FormValues) => {
    await updateCampaign({ id: campaignId, campaign: values });
    clHistory.push(`/admin/messaging/sms/${campaignId}`);
  };

  const goBack = () => clHistory.push(`/admin/messaging/sms/${campaignId}`);

  const groupIds = campaign.data.relationships.groups.data.map(
    (group) => group.id
  );

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <Title>
        <FormattedMessage {...messages.editSmsCampaignTitle} />
      </Title>
      <SmsCampaignForm
        isLoading={isLoading}
        defaultValues={{
          subject_multiloc: campaign.data.attributes.subject_multiloc,
          body_multiloc: campaign.data.attributes.body_multiloc,
          group_ids: groupIds,
        }}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default EditSmsCampaign;
