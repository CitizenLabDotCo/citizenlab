import * as React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import GetCampaign from 'resources/GetCampaign';

import { ICampaignData } from 'api/campaigns/types';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

interface Props {
  campaign: ICampaignData;
}

const Edit = ({ campaign }: Props) => {
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();
  const handleSubmit = async (values: FormValues) => {
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
        isLoading={isLoading}
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

export default withRouter((withRouterProps: WithRouterProps) => (
  <GetCampaign id={withRouterProps.params.campaignId}>
    {(campaign) =>
      isNilOrError(campaign) ? null : <Edit campaign={campaign} />
    }
  </GetCampaign>
));
