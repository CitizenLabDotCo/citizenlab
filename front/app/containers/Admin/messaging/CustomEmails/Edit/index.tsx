import * as React from 'react';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { PageTitle } from '../CampaignForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { Box } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import { isNil } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import useCampaign from 'api/campaigns/useCampaign';
import { CampaignFormValues } from 'api/campaigns/types';

const Edit = () => {
  const { mutate: updateCampaign } = useUpdateCampaign();
  const { campaignId } = useParams();
  const { data: { data: campaign } = {} } = useCampaign(campaignId);
  if (isNil(campaign)) return null;

  const handleSubmit = async (values: CampaignFormValues) => {
    await updateCampaign({ id: campaign.id, campaign: values });

    clHistory.push(`/admin/messaging/emails/custom/${campaign.id}`);
  };

  const goBack = () => {
    const { id } = campaign;
    clHistory.push(`/admin/messaging/emails/custom/${id}`);
  };

  return (
    <Box background={colors.white} p="40px">
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.editCampaignTitle} />
      </PageTitle>
      <CampaignForm
        onSubmit={handleSubmit}
        defaultValues={{
          sender: campaign.attributes.sender,
          reply_to: campaign.attributes.reply_to,
          subject_multiloc: campaign.attributes.subject_multiloc,
          body_multiloc: campaign.attributes.body_multiloc,
          group_ids: campaign.relationships.groups.data.map((d) => d.id),
        }}
      />
    </Box>
  );
};

export default Edit;
